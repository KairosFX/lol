import { writeFile } from "node:fs/promises";
import path from "node:path";

const EXPECTED_CHAMPION_COUNT = 172;
const OUTPUT_PATH = path.join(process.cwd(), "data", "champion-database.json");
const WIKI_MODULE_URL =
  "https://wiki.leagueoflegends.com/en-us/Module:ChampionData/data?action=raw";

const roleMap = {
  Top: "Top",
  Jungle: "Jungle",
  Middle: "Mid",
  Bottom: "ADC",
  Support: "Support",
};

const roleSummoners = {
  Top: ["Flash", "Teleport"],
  Jungle: ["Flash", "Smite"],
  Mid: ["Flash", "Ignite"],
  ADC: ["Flash", "Heal"],
  Support: ["Flash", "Ignite"],
};

const classRuneTemplates = {
  Assassin: { primaryPath: "Domination", secondaryPath: "Precision", keystone: "Electrocute" },
  Mage: { primaryPath: "Sorcery", secondaryPath: "Inspiration", keystone: "Arcane Comet" },
  Fighter: { primaryPath: "Precision", secondaryPath: "Resolve", keystone: "Conqueror" },
  Tank: { primaryPath: "Resolve", secondaryPath: "Precision", keystone: "Grasp of the Undying" },
  Marksman: { primaryPath: "Precision", secondaryPath: "Inspiration", keystone: "Press the Attack" },
  Support: { primaryPath: "Inspiration", secondaryPath: "Resolve", keystone: "Glacial Augment" },
};

const classItemTemplates = {
  Assassin: {
    core: ["Youmuu's Ghostblade", "Opportunity", "Edge of Night"],
    situational: ["Serylda's Grudge", "Maw of Malmortius", "Guardian Angel"],
  },
  Mage: {
    core: ["Luden's Companion", "Stormsurge", "Rabadon's Deathcap"],
    situational: ["Zhonya's Hourglass", "Void Staff", "Morellonomicon"],
  },
  Fighter: {
    core: ["Trinity Force", "Spear of Shojin", "Sterak's Gage"],
    situational: ["Black Cleaver", "Death's Dance", "Guardian Angel"],
  },
  Tank: {
    core: ["Heartsteel", "Sunfire Aegis", "Jak'Sho, The Protean"],
    situational: ["Thornmail", "Spirit Visage", "Randuin's Omen"],
  },
  Marksman: {
    core: ["Kraken Slayer", "Infinity Edge", "Lord Dominik's Regards"],
    situational: ["The Collector", "Bloodthirster", "Guardian Angel"],
  },
  Support: {
    core: ["Dream Maker", "Redemption", "Locket of the Iron Solari"],
    situational: ["Knight's Vow", "Mikael's Blessing", "Imperial Mandate"],
  },
};

const classCounterRules = {
  Assassin: {
    strong: ["Mage", "Marksman"],
    weak: ["Tank", "Fighter"],
  },
  Mage: {
    strong: ["Tank", "Fighter"],
    weak: ["Assassin", "Marksman"],
  },
  Fighter: {
    strong: ["Assassin", "Tank"],
    weak: ["Mage", "Marksman"],
  },
  Tank: {
    strong: ["Assassin", "Fighter"],
    weak: ["Mage", "Marksman"],
  },
  Marksman: {
    strong: ["Tank", "Fighter"],
    weak: ["Assassin", "Mage"],
  },
  Support: {
    strong: ["Assassin", "Fighter"],
    weak: ["Mage", "Marksman"],
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['.]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function universeSlugCandidates(champion) {
  const fromName = champion.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fromId = champion.id.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fromSlug = slugify(champion.name).replace(/-/g, "");
  const special = {
    monkeyking: "wukong",
    nunuwillump: "nunu",
  };

  return [...new Set([special[fromId], special[fromName], fromId, fromName, fromSlug].filter(Boolean))];
}

function regionNameFromSlug(slug) {
  if (!slug || slug === "unaffiliated") {
    return "Unaffiliated";
  }

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .replace("And", "&");
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchUniverseData(champion) {
  for (const candidate of universeSlugCandidates(champion)) {
    const url = `https://universe-meeps.leagueoflegends.com/v1/en_us/champions/${candidate}/index.json`;

    try {
      const data = await fetchJson(url);
      const regionSlug = data.champion?.["associated-faction-slug"] || "unaffiliated";
      return {
        region: data.champion?.["associated-faction"] || regionNameFromSlug(regionSlug),
        regionSlug,
        releaseDate: data.champion?.["release-date"]?.slice(0, 10),
        universeImage: data.champion?.image?.uri || null,
        sourceUrl: url,
      };
    } catch {
      // Some universe slugs intentionally differ from Data Dragon ids.
    }
  }

  return {
    region: "Unaffiliated",
    regionSlug: "unaffiliated",
    releaseDate: null,
    universeImage: null,
    sourceUrl: null,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBlock(raw, championName) {
  const marker = `["${championName}"] = {`;
  const start = raw.indexOf(marker);

  if (start === -1) {
    return "";
  }

  let depth = 0;
  let inString = false;
  let previous = "";
  const blockStart = raw.indexOf("{", start);

  for (let index = blockStart; index < raw.length; index += 1) {
    const char = raw[index];

    if (char === '"' && previous !== "\\") {
      inString = !inString;
    }

    if (!inString) {
      if (char === "{") {
        depth += 1;
      }

      if (char === "}") {
        depth -= 1;

        if (depth === 0) {
          return raw.slice(start, index + 1);
        }
      }
    }

    previous = char;
  }

  return "";
}

function stringField(block, field) {
  const match = block.match(new RegExp(`\\["${escapeRegex(field)}"\\]\\s*=\\s*"([^"]*)"`));
  return match?.[1] ?? null;
}

function numberField(block, field) {
  const match = block.match(new RegExp(`\\["${escapeRegex(field)}"\\]\\s*=\\s*([\\d.]+)`));
  return match ? Number(match[1]) : null;
}

function arrayField(block, field) {
  const match = block.match(new RegExp(`\\["${escapeRegex(field)}"\\]\\s*=\\s*\\{([^}]*)\\}`));

  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function parseWikiChampion(raw, championName) {
  const block = extractBlock(raw, championName);

  return {
    title: stringField(block, "title"),
    primaryClass: stringField(block, "herotype"),
    secondaryClass: stringField(block, "alttype"),
    resource: stringField(block, "resource"),
    rangeType: stringField(block, "rangetype"),
    releaseDate: stringField(block, "date"),
    releasePatch: stringField(block, "patch"),
    classes: arrayField(block, "role"),
    positions: arrayField(block, "client_positions").map((position) => roleMap[position] ?? position),
    difficulty: numberField(block, "difficulty"),
    ratings: {
      damage: numberField(block, "damage"),
      toughness: numberField(block, "toughness"),
      control: numberField(block, "control"),
      mobility: numberField(block, "mobility"),
      utility: numberField(block, "utility"),
      style: numberField(block, "style"),
    },
  };
}

function getDifficultyLabel(value) {
  if (value <= 1) {
    return "Beginner";
  }

  if (value === 2) {
    return "Intermediate";
  }

  return "Advanced";
}

function normalizeClass(value, fallback = "Fighter") {
  if (!value) {
    return fallback;
  }

  if (value === "Controller" || value === "Enchanter" || value === "Catcher") {
    return "Support";
  }

  if (value === "Slayer" || value === "Skirmisher" || value === "Diver" || value === "Juggernaut") {
    return "Fighter";
  }

  if (value === "Burst" || value === "Battlemage" || value === "Artillery") {
    return "Mage";
  }

  if (value === "Vanguard" || value === "Warden") {
    return "Tank";
  }

  if (["Assassin", "Mage", "Fighter", "Tank", "Marksman", "Support"].includes(value)) {
    return value;
  }

  return fallback;
}

function chooseRunePage(primaryClass, primaryRole, runePaths) {
  const template = primaryRole === "Jungle"
    ? { primaryPath: "Precision", secondaryPath: "Domination", keystone: "Conqueror" }
    : classRuneTemplates[primaryClass] ?? classRuneTemplates.Fighter;

  const pathData = runePaths.find((path) => path.name === template.primaryPath);
  const keystone = pathData?.slots?.[0]?.runes?.find((rune) => rune.name === template.keystone) ??
    pathData?.slots?.[0]?.runes?.[0];

  return {
    ...template,
    keystone: keystone
      ? {
          id: keystone.id,
          key: keystone.key,
          name: keystone.name,
          icon: `https://ddragon.leagueoflegends.com/cdn/img/${keystone.icon}`,
        }
      : null,
  };
}

function makeItemLookup(items) {
  const byName = new Map();

  for (const [id, item] of Object.entries(items)) {
    const mapScore = item.maps?.["11"] ? 20 : 0;
    const modePenalty = id.startsWith("22") || id.startsWith("30") ? -10 : 0;
    const storeScore = item.gold?.purchasable ? 2 : 0;
    const score = mapScore + modePenalty + storeScore;
    const key = item.name.toLowerCase();
    const current = byName.get(key);

    if (current && current.score >= score) {
      continue;
    }

    byName.set(key, {
      id,
      name: item.name,
      plaintext: item.plaintext ?? "",
      tags: item.tags ?? [],
      icon: null,
      score,
    });
  }

  return byName;
}

function findItems(names, itemLookup, version) {
  return names
    .map((name) => itemLookup.get(name.toLowerCase()))
    .filter(Boolean)
    .map((item) => ({
      id: item.id,
      name: item.name,
      plaintext: item.plaintext,
      tags: item.tags,
      icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.id}.png`,
    }));
}

function findSummoners(names, summonerLookup, version) {
  return names
    .map((name) => summonerLookup.get(name.toLowerCase()))
    .filter(Boolean)
    .map((spell) => ({
      ...spell,
      icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image}`,
    }));
}

function chooseSkillOrder(primaryClass, primaryRole) {
  if (primaryRole === "Support") {
    return ["Q", "E", "W"];
  }

  if (primaryClass === "Mage" || primaryClass === "Marksman") {
    return ["Q", "W", "E"];
  }

  return ["Q", "E", "W"];
}

function buildCounterProfiles(champions) {
  return champions.map((champion) => {
    const rules = classCounterRules[champion.classes.primary] ?? classCounterRules.Fighter;
    const sameRole = (candidate) =>
      candidate.slug !== champion.slug &&
      candidate.roles.some((role) => champion.roles.includes(role));
    const strongAgainst = champions
      .filter((candidate) => sameRole(candidate) && rules.strong.includes(candidate.classes.primary))
      .slice(0, 4)
      .map(({ slug, name, icon }) => ({ slug, name, icon }));
    const weakAgainst = champions
      .filter((candidate) => sameRole(candidate) && rules.weak.includes(candidate.classes.primary))
      .slice(0, 4)
      .map(({ slug, name, icon }) => ({ slug, name, icon }));

    return {
      slug: champion.slug,
      strongAgainst,
      weakAgainst,
    };
  });
}

async function main() {
  const versions = await fetchJson("https://ddragon.leagueoflegends.com/api/versions.json");
  const version = versions[0];
  const [championIndex, runePaths, summonerData, itemData, wikiRaw] = await Promise.all([
    fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`),
    fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`),
    fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`),
    fetchJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`),
    fetchText(WIKI_MODULE_URL),
  ]);

  const championSummaries = Object.values(championIndex.data).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  if (championSummaries.length !== EXPECTED_CHAMPION_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_CHAMPION_COUNT} Data Dragon champions, found ${championSummaries.length}`,
    );
  }

  const fullChampionEntries = [];

  for (const summary of championSummaries) {
    const detail = await fetchJson(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${summary.id}.json`,
    );
    const universe = await fetchUniverseData(summary);
    fullChampionEntries.push({
      summary,
      detail: detail.data[summary.id],
      universe,
      wiki: parseWikiChampion(wikiRaw, summary.name),
    });
  }

  const summonerLookup = new Map(
    Object.values(summonerData.data).map((spell) => [
      spell.name.toLowerCase(),
      {
        key: spell.key,
        id: spell.id,
        name: spell.name,
        description: spell.description.replace(/<[^>]*>/g, ""),
        image: spell.image.full,
      },
    ]),
  );
  const itemLookup = makeItemLookup(itemData.data);
  const compactRunePaths = runePaths.map((path) => ({
    id: path.id,
    key: path.key,
    name: path.name,
    icon: `https://ddragon.leagueoflegends.com/cdn/img/${path.icon}`,
  }));

  let champions = fullChampionEntries.map(({ summary, detail, universe, wiki }) => {
    const primaryClass = normalizeClass(wiki.primaryClass, normalizeClass(summary.tags?.[0]));
    const secondaryClass = wiki.secondaryClass ? normalizeClass(wiki.secondaryClass, "") : null;
    const roles = wiki.positions.length > 0 ? wiki.positions : ["Mid"];
    const primaryRole = roles[0];
    const itemTemplate = classItemTemplates[primaryClass] ?? classItemTemplates.Fighter;
    const summonerNames = roleSummoners[primaryRole] ?? roleSummoners.Mid;
    const icon = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${summary.image.full}`;

    return {
      id: summary.id,
      key: summary.key,
      slug: slugify(summary.name),
      name: summary.name,
      title: summary.title,
      blurb: summary.blurb,
      lore: detail.lore,
      roles,
      primaryRole,
      classes: {
        primary: primaryClass,
        secondary: secondaryClass || null,
        archetypes: wiki.classes.length > 0 ? wiki.classes : summary.tags ?? [],
      },
      region: universe.region || "Unaffiliated",
      regionSlug: universe.regionSlug || "unaffiliated",
      releaseDate: wiki.releaseDate ?? universe.releaseDate,
      releasePatch: wiki.releasePatch,
      resource: wiki.resource ?? summary.partype ?? "None",
      rangeType: wiki.rangeType ?? "Unknown",
      difficulty: {
        value: wiki.difficulty ?? Math.max(1, Math.ceil((summary.info?.difficulty ?? 5) / 3.4)),
        label: getDifficultyLabel(wiki.difficulty ?? Math.max(1, Math.ceil((summary.info?.difficulty ?? 5) / 3.4))),
      },
      ratings: {
        attack: summary.info.attack,
        defense: summary.info.defense,
        magic: summary.info.magic,
        difficulty: summary.info.difficulty,
        ...wiki.ratings,
      },
      stats: {
        hp: summary.stats.hp,
        hpPerLevel: summary.stats.hpperlevel,
        resource: summary.stats.mp,
        resourcePerLevel: summary.stats.mpperlevel,
        attackDamage: summary.stats.attackdamage,
        attackDamagePerLevel: summary.stats.attackdamageperlevel,
        abilityPower: 0,
        armor: summary.stats.armor,
        armorPerLevel: summary.stats.armorperlevel,
        magicResist: summary.stats.spellblock,
        magicResistPerLevel: summary.stats.spellblockperlevel,
        moveSpeed: summary.stats.movespeed,
        attackRange: summary.stats.attackrange,
        attackSpeed: summary.stats.attackspeed,
      },
      icon,
      images: {
        icon,
        splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${summary.id}_0.jpg`,
        loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${summary.id}_0.jpg`,
        universe: universe.universeImage,
      },
      abilities: [
        {
          slot: "P",
          name: detail.passive.name,
          description: detail.passive.description.replace(/<[^>]*>/g, ""),
          icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${detail.passive.image.full}`,
        },
        ...detail.spells.map((spell, index) => ({
          slot: ["Q", "W", "E", "R"][index],
          name: spell.name,
          description: spell.description.replace(/<[^>]*>/g, ""),
          cooldown: spell.cooldownBurn,
          cost: spell.costBurn,
          range: spell.rangeBurn,
          icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`,
        })),
      ],
      recommendations: {
        skillOrder: chooseSkillOrder(primaryClass, primaryRole),
        runePage: chooseRunePage(primaryClass, primaryRole, runePaths),
        summonerSpells: findSummoners(summonerNames, summonerLookup, version),
        coreItems: findItems(itemTemplate.core, itemLookup, version),
        situationalItems: findItems(itemTemplate.situational, itemLookup, version),
      },
      liveStats: {
        winRate: null,
        pickRate: null,
        banRate: null,
        source: null,
      },
      sources: {
        riotDataDragon: `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${summary.id}.json`,
        riotUniverse: universe.sourceUrl,
        leagueWiki: WIKI_MODULE_URL,
      },
      searchText: [
        summary.name,
        summary.title,
        roles.join(" "),
        primaryClass,
        secondaryClass,
        wiki.classes.join(" "),
        universe.region,
        summary.blurb,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });

  const counterProfiles = buildCounterProfiles(champions);
  const counterMap = new Map(counterProfiles.map((profile) => [profile.slug, profile]));
  champions = champions.map((champion) => ({
    ...champion,
    matchups: counterMap.get(champion.slug) ?? {
      strongAgainst: [],
      weakAgainst: [],
    },
  }));

  const duplicateSlugs = champions
    .map((champion) => champion.slug)
    .filter((slug, index, all) => all.indexOf(slug) !== index);

  if (duplicateSlugs.length > 0) {
    throw new Error(`Duplicate champion slugs: ${duplicateSlugs.join(", ")}`);
  }

  const missingFields = champions.filter(
    (champion) =>
      !champion.releaseDate ||
      !champion.resource ||
      !champion.roles.length ||
      !champion.classes.primary,
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Champion data missing required fields: ${missingFields
        .map((champion) => champion.name)
        .join(", ")}`,
    );
  }

  const payload = {
    version,
    generatedAt: new Date().toISOString(),
    expectedChampionCount: EXPECTED_CHAMPION_COUNT,
    championCount: champions.length,
    sources: [
      "https://developer.riotgames.com/docs/lol",
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
      WIKI_MODULE_URL,
      "https://universe-meeps.leagueoflegends.com",
    ],
    runePaths: compactRunePaths,
    roleTabs: ["Top", "Jungle", "Mid", "ADC", "Support"],
    classTabs: ["Assassin", "Mage", "Fighter", "Tank", "Marksman", "Support"],
    mapSystems: {
      lanes: [
        { role: "Top", assignment: "Solo side lane pressure, front line, or split push control." },
        { role: "Jungle", assignment: "Camp sequencing, gank windows, vision denial, and objective setup." },
        { role: "Mid", assignment: "Wave control, roam timers, burst windows, and river priority." },
        { role: "ADC", assignment: "Bottom lane scaling, sustained DPS, tower pressure, and late-game carry duty." },
        { role: "Support", assignment: "Vision control, lane protection, engage/disengage, and map movement." },
      ],
      objectiveTimers: [
        { objective: "Dragon", firstSpawn: "5:00", respawn: "5:00" },
        { objective: "Voidgrubs", firstSpawn: "6:00", respawn: "4:00" },
        { objective: "Rift Herald", firstSpawn: "16:00", respawn: "Single spawn" },
        { objective: "Baron Nashor", firstSpawn: "20:00", respawn: "6:00" },
        { objective: "Elder Dragon", firstSpawn: "After elemental soul", respawn: "6:00" },
      ],
      csGuide: [
        { role: "Top", target: "7-9 CS/min while preserving teleport and side-lane pressure." },
        { role: "Jungle", target: "Full-clear efficiency plus objective trades; farm count varies by route." },
        { role: "Mid", target: "7-9 CS/min with roam timing after crash windows." },
        { role: "ADC", target: "8-10 CS/min as the primary farm funnel." },
        { role: "Support", target: "Quest progression, vision score, and roam tempo over minion CS." },
      ],
      junglePaths: [
        "Full clear toward the lane with strongest setup.",
        "Three-camp gank when your champion has reliable early CC or burst.",
        "Cross-map trade when enemy jungle shows on the opposite side.",
      ],
    },
    champions,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Generated ${champions.length} champions from Data Dragon ${version}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
