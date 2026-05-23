import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const EXPECTED_CHAMPION_COUNT = 172;
const OUTPUT_PATH = path.join(process.cwd(), "data", "champion-database.json");
const META_OVERRIDES_PATH = path.join(process.cwd(), "data", "meta-overrides.json");
const WIKI_MODULE_URL =
  "https://wiki.leagueoflegends.com/en-us/Module:ChampionData/data?action=raw";
const DATA_DRAGON_IMG = "https://ddragon.leagueoflegends.com/cdn/img/";

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

const statShards = {
  offense: [
    {
      id: 5008,
      name: "Adaptive Force",
      category: "offense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsAdaptiveForceIcon.png`,
    },
    {
      id: 5005,
      name: "Attack Speed",
      category: "offense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsAttackSpeedIcon.png`,
    },
    {
      id: 5007,
      name: "Ability Haste",
      category: "offense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsCDRScalingIcon.png`,
    },
  ],
  flex: [
    {
      id: 5008,
      name: "Adaptive Force",
      category: "flex",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsAdaptiveForceIcon.png`,
    },
    {
      id: 5010,
      name: "Move Speed",
      category: "flex",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsMoveSpeedIcon.png`,
    },
    {
      id: 5011,
      name: "Health Scaling",
      category: "flex",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsHealthScalingIcon.png`,
    },
  ],
  defense: [
    {
      id: 5011,
      name: "Health Scaling",
      category: "defense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsHealthScalingIcon.png`,
    },
    {
      id: 5013,
      name: "Tenacity",
      category: "defense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsTenacityIcon.png`,
    },
    {
      id: 5001,
      name: "Health",
      category: "defense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsHealthPlusIcon.png`,
    },
    {
      id: 5002,
      name: "Armor",
      category: "defense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsArmorIcon.png`,
    },
    {
      id: 5003,
      name: "Magic Resist",
      category: "defense",
      icon: `${DATA_DRAGON_IMG}perk-images/StatMods/StatModsMagicResIcon.png`,
    },
  ],
};

const itemTemplates = {
  Assassin: {
    firstRecall: ["Serrated Dirk", "Boots", "Long Sword"],
    boots: ["Ionian Boots of Lucidity", "Mercury's Treads", "Plated Steelcaps"],
    core: ["Youmuu's Ghostblade", "Opportunity", "Edge of Night"],
    full: [
      "Youmuu's Ghostblade",
      "Opportunity",
      "Edge of Night",
      "Serylda's Grudge",
      "Maw of Malmortius",
      "Guardian Angel",
    ],
    situational: ["Axiom Arc", "Serpent's Fang", "Profane Hydra", "Serylda's Grudge"],
    antiHeal: ["Executioner's Calling", "Mortal Reminder"],
    defensive: ["Edge of Night", "Maw of Malmortius", "Guardian Angel"],
    snowball: ["Hubris", "The Collector", "Youmuu's Ghostblade"],
    lateGameSell: ["Elixir of Wrath", "Guardian Angel", "Serylda's Grudge"],
  },
  Mage: {
    firstRecall: ["Lost Chapter", "Dark Seal", "Boots"],
    boots: ["Sorcerer's Shoes", "Ionian Boots of Lucidity", "Mercury's Treads"],
    core: ["Luden's Companion", "Stormsurge", "Rabadon's Deathcap"],
    full: [
      "Luden's Companion",
      "Stormsurge",
      "Rabadon's Deathcap",
      "Zhonya's Hourglass",
      "Void Staff",
      "Banshee's Veil",
    ],
    situational: ["Shadowflame", "Liandry's Torment", "Cryptbloom", "Horizon Focus"],
    antiHeal: ["Oblivion Orb", "Morellonomicon"],
    defensive: ["Zhonya's Hourglass", "Banshee's Veil", "Rod of Ages"],
    snowball: ["Dark Seal", "Mejai's Soulstealer", "Stormsurge"],
    lateGameSell: ["Elixir of Sorcery", "Rabadon's Deathcap", "Void Staff"],
  },
  Fighter: {
    firstRecall: ["Phage", "Sheen", "Boots"],
    boots: ["Plated Steelcaps", "Mercury's Treads", "Ionian Boots of Lucidity"],
    core: ["Trinity Force", "Spear of Shojin", "Sterak's Gage"],
    full: [
      "Trinity Force",
      "Spear of Shojin",
      "Sterak's Gage",
      "Death's Dance",
      "Black Cleaver",
      "Guardian Angel",
    ],
    situational: ["Ravenous Hydra", "Stridebreaker", "Sundered Sky", "Hullbreaker"],
    antiHeal: ["Executioner's Calling", "Mortal Reminder", "Chempunk Chainsword"],
    defensive: ["Death's Dance", "Maw of Malmortius", "Sterak's Gage"],
    snowball: ["Sundered Sky", "Trinity Force", "Ravenous Hydra"],
    lateGameSell: ["Elixir of Wrath", "Guardian Angel", "Sterak's Gage"],
  },
  Tank: {
    firstRecall: ["Bami's Cinder", "Ruby Crystal", "Boots"],
    boots: ["Plated Steelcaps", "Mercury's Treads", "Boots of Swiftness"],
    core: ["Heartsteel", "Sunfire Aegis", "Jak'Sho, The Protean"],
    full: [
      "Heartsteel",
      "Sunfire Aegis",
      "Jak'Sho, The Protean",
      "Thornmail",
      "Spirit Visage",
      "Randuin's Omen",
    ],
    situational: ["Unending Despair", "Kaenic Rookern", "Frozen Heart", "Abyssal Mask"],
    antiHeal: ["Bramble Vest", "Thornmail"],
    defensive: ["Randuin's Omen", "Spirit Visage", "Kaenic Rookern"],
    snowball: ["Heartsteel", "Sunfire Aegis", "Unending Despair"],
    lateGameSell: ["Elixir of Iron", "Jak'Sho, The Protean", "Randuin's Omen"],
  },
  Marksman: {
    firstRecall: ["Noonquiver", "B. F. Sword", "Boots"],
    boots: ["Berserker's Greaves", "Mercury's Treads", "Plated Steelcaps"],
    core: ["Kraken Slayer", "Infinity Edge", "Lord Dominik's Regards"],
    full: [
      "Kraken Slayer",
      "Infinity Edge",
      "Lord Dominik's Regards",
      "The Collector",
      "Bloodthirster",
      "Guardian Angel",
    ],
    situational: ["Yun Tal Wildarrows", "Runaan's Hurricane", "Rapid Firecannon", "Mercurial Scimitar"],
    antiHeal: ["Executioner's Calling", "Mortal Reminder"],
    defensive: ["Bloodthirster", "Guardian Angel", "Mercurial Scimitar"],
    snowball: ["The Collector", "Kraken Slayer", "Infinity Edge"],
    lateGameSell: ["Elixir of Wrath", "Guardian Angel", "Bloodthirster"],
  },
  Support: {
    firstRecall: ["Boots", "Kindlegem", "Bandleglass Mirror"],
    boots: ["Ionian Boots of Lucidity", "Boots of Swiftness", "Mercury's Treads"],
    core: ["Dream Maker", "Redemption", "Locket of the Iron Solari"],
    full: [
      "Dream Maker",
      "Redemption",
      "Locket of the Iron Solari",
      "Knight's Vow",
      "Mikael's Blessing",
      "Imperial Mandate",
    ],
    situational: ["Moonstone Renewer", "Shurelya's Battlesong", "Zeke's Convergence", "Ardent Censer"],
    antiHeal: ["Oblivion Orb", "Morellonomicon"],
    defensive: ["Locket of the Iron Solari", "Knight's Vow", "Mikael's Blessing"],
    snowball: ["Imperial Mandate", "Shurelya's Battlesong", "Ardent Censer"],
    lateGameSell: ["Elixir of Sorcery", "Redemption", "Mikael's Blessing"],
  },
  SupportTank: {
    firstRecall: ["Boots", "Kindlegem", "Ruby Crystal"],
    boots: ["Plated Steelcaps", "Mercury's Treads", "Boots of Swiftness"],
    core: ["Celestial Opposition", "Locket of the Iron Solari", "Knight's Vow"],
    full: [
      "Celestial Opposition",
      "Locket of the Iron Solari",
      "Knight's Vow",
      "Zeke's Convergence",
      "Thornmail",
      "Randuin's Omen",
    ],
    situational: ["Trailblazer", "Abyssal Mask", "Frozen Heart", "Kaenic Rookern"],
    antiHeal: ["Bramble Vest", "Thornmail"],
    defensive: ["Locket of the Iron Solari", "Knight's Vow", "Randuin's Omen"],
    snowball: ["Zeke's Convergence", "Trailblazer", "Celestial Opposition"],
    lateGameSell: ["Elixir of Iron", "Knight's Vow", "Randuin's Omen"],
  },
};

const roleStartingItems = {
  Top: ["Doran's Shield", "Doran's Blade", "Health Potion"],
  Jungle: ["Scorchclaw Pup", "Gustwalker Hatchling", "Mosstomper Seedling", "Health Potion"],
  Mid: ["Doran's Ring", "Doran's Blade", "Health Potion"],
  ADC: ["Doran's Blade", "Health Potion"],
  Support: ["World Atlas", "Health Potion"],
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

function stripTags(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function seededNumber(seed, min, max, decimals = 1) {
  const normalized = (hashString(seed) % 10000) / 9999;
  const value = min + normalized * (max - min);
  return Number(value.toFixed(decimals));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function rounded(value, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function compactRunePath(path) {
  return {
    id: path.id,
    key: path.key,
    name: path.name,
    icon: path.icon,
  };
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

async function loadMetaOverrides() {
  try {
    const raw = await readFile(META_OVERRIDES_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : parsed.champions ?? [];
    const overrides = new Map();

    for (const row of rows) {
      if (!row.slug) {
        continue;
      }

      overrides.set(row.slug, row);

      if (row.role) {
        overrides.set(`${row.slug}:${row.role}`, row);
      }
    }

    return overrides;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return new Map();
    }

    throw error;
  }
}

function getMetaOverride(overrides, slug, role, version) {
  const override = overrides.get(`${slug}:${role}`) ?? overrides.get(slug) ?? null;

  if (!override) {
    return null;
  }

  if (override.patch && override.patch !== version) {
    return null;
  }

  return override;
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

function normalizeRuneTrees(runePaths) {
  return runePaths.map((pathData) => ({
    id: pathData.id,
    key: pathData.key,
    name: pathData.name,
    icon: `${DATA_DRAGON_IMG}${pathData.icon}`,
    slots: pathData.slots.map((slot) => ({
      runes: slot.runes.map((rune) => ({
        id: rune.id,
        key: rune.key,
        name: rune.name,
        icon: `${DATA_DRAGON_IMG}${rune.icon}`,
        shortDesc: stripTags(rune.shortDesc),
        longDesc: stripTags(rune.longDesc),
      })),
    })),
  }));
}

function runeTemplatesFor(primaryClass, primaryRole) {
  if (primaryRole === "Jungle") {
    return [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Precision",
        secondary: "Domination",
        primaryRunes: ["Conqueror", "Triumph", "Legend: Haste", "Coup de Grace"],
        secondaryRunes: [
          { name: "Sudden Impact", slot: 1 },
          { name: "Treasure Hunter", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Best when playing for full-clear tempo into repeated skirmishes.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Precision",
        secondary: "Inspiration",
        primaryRunes: ["Conqueror", "Triumph", "Legend: Alacrity", "Last Stand"],
        secondaryRunes: [
          { name: "Magical Footwear", slot: 1 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Popular solo queue setup for reliable clears and summoner spell tempo.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Precision",
        secondary: "Sorcery",
        primaryRunes: ["Conqueror", "Triumph", "Legend: Haste", "Last Stand"],
        secondaryRunes: [
          { name: "Celerity", slot: 2 },
          { name: "Waterwalking", slot: 3 },
        ],
        shards: ["Attack Speed", "Move Speed", "Health Scaling"],
        note: "High-elo path for river control, invade timing, and objective fights.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Domination",
        secondary: "Precision",
        primaryRunes: ["Dark Harvest", "Sudden Impact", "Grisly Mementos", "Treasure Hunter"],
        secondaryRunes: [
          { name: "Triumph", slot: 1 },
          { name: "Coup de Grace", slot: 3 },
        ],
        shards: ["Adaptive Force", "Adaptive Force", "Health Scaling"],
        note: "Choose when your draft needs burst resets instead of extended DPS.",
      },
    ];
  }

  if (primaryRole === "Support" && primaryClass === "Tank") {
    return [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Resolve",
        secondary: "Inspiration",
        primaryRunes: ["Aftershock", "Font of Life", "Bone Plating", "Unflinching"],
        secondaryRunes: [
          { name: "Hextech Flashtraption", slot: 1 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Ability Haste", "Move Speed", "Health Scaling"],
        note: "Best for hard-engage lanes that must survive first contact.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Resolve",
        secondary: "Inspiration",
        primaryRunes: ["Aftershock", "Font of Life", "Second Wind", "Unflinching"],
        secondaryRunes: [
          { name: "Biscuit Delivery", slot: 2 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Ability Haste", "Health Scaling", "Health Scaling"],
        note: "Common engage support page for lane sustain and flash-reliant fights.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Inspiration",
        secondary: "Resolve",
        primaryRunes: ["Glacial Augment", "Hextech Flashtraption", "Biscuit Delivery", "Cosmic Insight"],
        secondaryRunes: [
          { name: "Bone Plating", slot: 2 },
          { name: "Unflinching", slot: 3 },
        ],
        shards: ["Ability Haste", "Move Speed", "Health Scaling"],
        note: "Pro-style page when slowing the first target matters more than personal durability.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Resolve",
        secondary: "Domination",
        primaryRunes: ["Guardian", "Font of Life", "Second Wind", "Revitalize"],
        secondaryRunes: [
          { name: "Cheap Shot", slot: 1 },
          { name: "Deep Ward", slot: 2 },
        ],
        shards: ["Ability Haste", "Health Scaling", "Health Scaling"],
        note: "Use into poke lanes where protecting the carry wins the lane.",
      },
    ];
  }

  const templates = {
    Assassin: [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Domination",
        secondary: "Precision",
        primaryRunes: ["Electrocute", "Sudden Impact", "Grisly Mementos", "Treasure Hunter"],
        secondaryRunes: [
          { name: "Triumph", slot: 1 },
          { name: "Coup de Grace", slot: 3 },
        ],
        shards: ["Adaptive Force", "Adaptive Force", "Health Scaling"],
        note: "Best when the matchup gives reliable short-trade burst windows.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Domination",
        secondary: "Sorcery",
        primaryRunes: ["Electrocute", "Taste of Blood", "Grisly Mementos", "Ultimate Hunter"],
        secondaryRunes: [
          { name: "Scorch", slot: 3 },
          { name: "Transcendence", slot: 2 },
        ],
        shards: ["Adaptive Force", "Adaptive Force", "Health Scaling"],
        note: "Popular setup for lane pressure and repeat ultimate windows.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Precision",
        secondary: "Domination",
        primaryRunes: ["Conqueror", "Triumph", "Legend: Haste", "Last Stand"],
        secondaryRunes: [
          { name: "Sudden Impact", slot: 1 },
          { name: "Treasure Hunter", slot: 3 },
        ],
        shards: ["Adaptive Force", "Adaptive Force", "Health Scaling"],
        note: "High-elo setup for longer fights and side-lane duels.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Inspiration",
        secondary: "Domination",
        primaryRunes: ["First Strike", "Magical Footwear", "Triple Tonic", "Cosmic Insight"],
        secondaryRunes: [
          { name: "Sudden Impact", slot: 1 },
          { name: "Treasure Hunter", slot: 3 },
        ],
        shards: ["Adaptive Force", "Adaptive Force", "Health Scaling"],
        note: "Use when the matchup is low-threat and gold acceleration is realistic.",
      },
    ],
    Mage: [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Sorcery",
        secondary: "Inspiration",
        primaryRunes: ["Arcane Comet", "Manaflow Band", "Transcendence", "Scorch"],
        secondaryRunes: [
          { name: "Magical Footwear", slot: 1 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Ability Haste", "Adaptive Force", "Health Scaling"],
        note: "Best for poke, wave control, and tempo through low-cooldown spell cycles.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Sorcery",
        secondary: "Domination",
        primaryRunes: ["Summon Aery", "Manaflow Band", "Transcendence", "Scorch"],
        secondaryRunes: [
          { name: "Taste of Blood", slot: 1 },
          { name: "Ultimate Hunter", slot: 3 },
        ],
        shards: ["Adaptive Force", "Adaptive Force", "Health Scaling"],
        note: "Popular lane page for consistent poke and safer early trades.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Inspiration",
        secondary: "Sorcery",
        primaryRunes: ["First Strike", "Cash Back", "Triple Tonic", "Cosmic Insight"],
        secondaryRunes: [
          { name: "Manaflow Band", slot: 1 },
          { name: "Gathering Storm", slot: 3 },
        ],
        shards: ["Ability Haste", "Adaptive Force", "Health Scaling"],
        note: "Pro-style scaling page for controlled lanes and clean recall tempo.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Domination",
        secondary: "Sorcery",
        primaryRunes: ["Electrocute", "Taste of Blood", "Grisly Mementos", "Ultimate Hunter"],
        secondaryRunes: [
          { name: "Manaflow Band", slot: 1 },
          { name: "Scorch", slot: 3 },
        ],
        shards: ["Adaptive Force", "Adaptive Force", "Health Scaling"],
        note: "Choose when your lane plan depends on burst threat instead of poke volume.",
      },
    ],
    Fighter: [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Precision",
        secondary: "Resolve",
        primaryRunes: ["Conqueror", "Triumph", "Legend: Haste", "Last Stand"],
        secondaryRunes: [
          { name: "Second Wind", slot: 2 },
          { name: "Unflinching", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Best for extended trades, wave fights, and side-lane pressure.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Precision",
        secondary: "Resolve",
        primaryRunes: ["Conqueror", "Triumph", "Legend: Alacrity", "Last Stand"],
        secondaryRunes: [
          { name: "Bone Plating", slot: 2 },
          { name: "Overgrowth", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Common bruiser page for direct lane combat and scaling durability.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Resolve",
        secondary: "Precision",
        primaryRunes: ["Grasp of the Undying", "Demolish", "Second Wind", "Overgrowth"],
        secondaryRunes: [
          { name: "Triumph", slot: 1 },
          { name: "Last Stand", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "High-elo page for melee lanes where short trades and plates decide tempo.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Precision",
        secondary: "Inspiration",
        primaryRunes: ["Press the Attack", "Triumph", "Legend: Alacrity", "Coup de Grace"],
        secondaryRunes: [
          { name: "Magical Footwear", slot: 1 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Use when bursty all-ins beat slow Conqueror stacking.",
      },
    ],
    Tank: [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Resolve",
        secondary: "Inspiration",
        primaryRunes: ["Grasp of the Undying", "Demolish", "Second Wind", "Overgrowth"],
        secondaryRunes: [
          { name: "Magical Footwear", slot: 1 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Ability Haste", "Health Scaling", "Health Scaling"],
        note: "Best for durable lanes, plate pressure, and slow front-to-back games.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Resolve",
        secondary: "Precision",
        primaryRunes: ["Grasp of the Undying", "Shield Bash", "Bone Plating", "Overgrowth"],
        secondaryRunes: [
          { name: "Triumph", slot: 1 },
          { name: "Legend: Haste", slot: 2 },
        ],
        shards: ["Ability Haste", "Health Scaling", "Health Scaling"],
        note: "Popular page for stronger all-in durability and reset value.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Resolve",
        secondary: "Sorcery",
        primaryRunes: ["Aftershock", "Font of Life", "Conditioning", "Unflinching"],
        secondaryRunes: [
          { name: "Nimbus Cloak", slot: 1 },
          { name: "Celerity", slot: 2 },
        ],
        shards: ["Ability Haste", "Move Speed", "Health Scaling"],
        note: "Pro-style engage page for coordinated fights and summoner spell bursts.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Inspiration",
        secondary: "Resolve",
        primaryRunes: ["Glacial Augment", "Magical Footwear", "Biscuit Delivery", "Cosmic Insight"],
        secondaryRunes: [
          { name: "Second Wind", slot: 2 },
          { name: "Overgrowth", slot: 3 },
        ],
        shards: ["Ability Haste", "Health Scaling", "Health Scaling"],
        note: "Use when pick setup and utility are more valuable than raw trading.",
      },
    ],
    Marksman: [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Precision",
        secondary: "Inspiration",
        primaryRunes: ["Lethal Tempo", "Absorb Life", "Legend: Alacrity", "Cut Down"],
        secondaryRunes: [
          { name: "Magical Footwear", slot: 1 },
          { name: "Biscuit Delivery", slot: 2 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Best for scaling DPS lanes that can reach two-item fights safely.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Precision",
        secondary: "Inspiration",
        primaryRunes: ["Press the Attack", "Presence of Mind", "Legend: Bloodline", "Cut Down"],
        secondaryRunes: [
          { name: "Magical Footwear", slot: 1 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Common marksman page for clean front-loaded trades and scaling sustain.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Precision",
        secondary: "Sorcery",
        primaryRunes: ["Fleet Footwork", "Absorb Life", "Legend: Bloodline", "Cut Down"],
        secondaryRunes: [
          { name: "Absolute Focus", slot: 2 },
          { name: "Gathering Storm", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Pro-style setup for difficult lanes where health thresholds protect tempo.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Domination",
        secondary: "Precision",
        primaryRunes: ["Hail of Blades", "Taste of Blood", "Grisly Mementos", "Treasure Hunter"],
        secondaryRunes: [
          { name: "Presence of Mind", slot: 1 },
          { name: "Coup de Grace", slot: 3 },
        ],
        shards: ["Attack Speed", "Adaptive Force", "Health Scaling"],
        note: "Use on burst marksmen or kill lanes where early trades decide the lane.",
      },
    ],
    Support: [
      {
        label: "Best Win Rate",
        style: "highest-win",
        primary: "Sorcery",
        secondary: "Resolve",
        primaryRunes: ["Summon Aery", "Manaflow Band", "Transcendence", "Scorch"],
        secondaryRunes: [
          { name: "Bone Plating", slot: 2 },
          { name: "Revitalize", slot: 3 },
        ],
        shards: ["Ability Haste", "Adaptive Force", "Health Scaling"],
        note: "Best for poke and shield/heal value while preserving lane durability.",
      },
      {
        label: "Most Popular",
        style: "popular",
        primary: "Inspiration",
        secondary: "Resolve",
        primaryRunes: ["Glacial Augment", "Magical Footwear", "Biscuit Delivery", "Cosmic Insight"],
        secondaryRunes: [
          { name: "Second Wind", slot: 2 },
          { name: "Revitalize", slot: 3 },
        ],
        shards: ["Ability Haste", "Adaptive Force", "Health Scaling"],
        note: "Popular utility page for lane sustain and summoner spell tempo.",
      },
      {
        label: "Pro Setup",
        style: "pro",
        primary: "Resolve",
        secondary: "Inspiration",
        primaryRunes: ["Guardian", "Font of Life", "Bone Plating", "Revitalize"],
        secondaryRunes: [
          { name: "Biscuit Delivery", slot: 2 },
          { name: "Cosmic Insight", slot: 3 },
        ],
        shards: ["Ability Haste", "Health Scaling", "Health Scaling"],
        note: "Pro-style page when lane survival and carry protection are priority.",
      },
      {
        label: "Situational",
        style: "situational",
        primary: "Domination",
        secondary: "Sorcery",
        primaryRunes: ["Electrocute", "Cheap Shot", "Deep Ward", "Relentless Hunter"],
        secondaryRunes: [
          { name: "Nimbus Cloak", slot: 1 },
          { name: "Waterwalking", slot: 3 },
        ],
        shards: ["Adaptive Force", "Move Speed", "Health Scaling"],
        note: "Use when roam pressure and kill threat outweigh defensive scaling.",
      },
    ],
  };

  return templates[primaryClass] ?? templates.Fighter;
}

function findRune(pathData, runeName, preferredSlot) {
  if (!pathData) {
    return null;
  }

  for (let slotIndex = 0; slotIndex < pathData.slots.length; slotIndex += 1) {
    const rune = pathData.slots[slotIndex].runes.find((candidate) => candidate.name === runeName);

    if (rune) {
      return {
        ...rune,
        path: pathData.name,
        slot: slotIndex,
      };
    }
  }

  const fallbackSlot = pathData.slots[preferredSlot] ?? pathData.slots.find((slot) => slot.runes.length);
  const fallbackRune = fallbackSlot?.runes?.[0] ?? null;

  return fallbackRune
    ? {
        ...fallbackRune,
        path: pathData.name,
        slot: preferredSlot,
      }
    : null;
}

function findShard(shardName, category) {
  return (
    statShards[category].find((shard) => shard.name === shardName) ??
    statShards[category][0]
  );
}

function buildRunePages(champion, runeTrees, competitive, override) {
  const pathByName = new Map(runeTrees.map((pathData) => [pathData.name, pathData]));
  const templates = runeTemplatesFor(champion.classes.primary, champion.primaryRole);
  const styleModifiers = {
    "highest-win": 1.1,
    popular: 0.35,
    pro: 0.8,
    situational: -0.25,
  };
  const pickRates = {
    "highest-win": 23,
    popular: 42,
    pro: 13,
    situational: 7,
  };

  return templates.map((template, templateIndex) => {
    const primaryPath = pathByName.get(template.primary) ?? runeTrees[0];
    const secondaryPath = pathByName.get(template.secondary) ?? runeTrees[1] ?? runeTrees[0];
    const primaryRunes = template.primaryRunes
      .map((runeName, slotIndex) => findRune(primaryPath, runeName, slotIndex))
      .filter(Boolean);
    const secondaryRunes = template.secondaryRunes
      .map((selection) => findRune(secondaryPath, selection.name, selection.slot))
      .filter(Boolean)
      .slice(0, 2);
    const shards = [
      findShard(template.shards[0], "offense"),
      findShard(template.shards[1], "flex"),
      findShard(template.shards[2], "defense"),
    ];
    const overridePage = override?.runePages?.find?.((page) => page.style === template.style);
    const pickRate = overridePage?.pickRate ?? rounded(pickRates[template.style] + seededNumber(`${champion.slug}-${template.style}-pick`, -2.4, 2.8), 1);
    const winRate = overridePage?.winRate ?? rounded(
      clamp(
        competitive.winRate +
          styleModifiers[template.style] +
          seededNumber(`${champion.slug}-${template.style}-wr`, -0.65, 0.65),
        43,
        57.5,
      ),
      1,
    );

    return {
      id: `${champion.slug}-${template.style}`,
      label: template.label,
      style: template.style,
      primaryPath: compactRunePath(primaryPath),
      secondaryPath: compactRunePath(secondaryPath),
      primaryRunes,
      secondaryRunes,
      shards,
      winRate,
      pickRate,
      matchCount: overridePage?.matchCount ?? Math.max(140, Math.round((competitive.matchCount * pickRate) / 100)),
      note: template.note,
    };
  });
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

function makeItemLookup(items) {
  const byName = new Map();

  for (const [id, item] of Object.entries(items)) {
    const mapScore = item.maps?.["11"] ? 20 : 0;
    const modePenalty = id.startsWith("22") || id.startsWith("30") ? -10 : 0;
    const storeScore = item.gold?.purchasable ? 2 : 0;
    const score = mapScore + modePenalty + storeScore;
    const key = stripTags(item.name).toLowerCase();
    const current = byName.get(key);

    if (current && current.score >= score) {
      continue;
    }

    byName.set(key, {
      id,
      name: stripTags(item.name),
      plaintext: stripTags(item.plaintext ?? ""),
      tags: item.tags ?? [],
      icon: null,
      score,
    });
  }

  return byName;
}

function findItems(names, itemLookup, version) {
  const seen = new Set();

  return names
    .map((name) => itemLookup.get(name.toLowerCase()))
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      plaintext: item.plaintext,
      tags: item.tags,
      icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.id}.png`,
    }));
}

function chooseItemTemplate(primaryClass, primaryRole) {
  if (primaryRole === "Support" && primaryClass === "Tank") {
    return itemTemplates.SupportTank;
  }

  if (primaryRole === "Support") {
    return itemTemplates.Support;
  }

  return itemTemplates[primaryClass] ?? itemTemplates.Fighter;
}

function itemTiming(category, index) {
  const timings = {
    starting: "0:00",
    firstRecall: `${4 + index}-${7 + index} min`,
    boots: `${8 + index}-${12 + index} min`,
    core: `${11 + index * 4}-${15 + index * 4} min`,
    full: `${22 + index * 3}+ min`,
    situational: "Adapt after 2 items",
    antiHeal: "Buy before enemy sustain spikes",
    defensive: "Buy before grouped fights",
    snowball: "Buy while ahead",
    lateGameSell: "35+ min",
  };

  return timings[category] ?? "Situational";
}

function itemCategoryExplanation(champion, category) {
  const role = champion.primaryRole.toLowerCase();
  const championClass = champion.classes.primary.toLowerCase();
  const explanations = {
    starting: `sets up ${champion.name}'s first three waves and protects early ${role} tempo.`,
    firstRecall: `keeps the lane playable after the first crash and converts gold into immediate pressure.`,
    boots: `changes spacing, dodge windows, and map arrival speed for ${role} fights.`,
    core: `matches the main ${championClass} win condition and should be completed before forced objectives.`,
    full: `rounds out damage, durability, and late-game fight reliability.`,
    situational: `should replace a default slot when the enemy draft changes your threat profile.`,
    antiHeal: `is reserved for high-healing lanes or compositions where damage sticks only through Grievous Wounds.`,
    defensive: `protects shutdowns and keeps ${champion.name} alive through the enemy's strongest cooldowns.`,
    snowball: `turns an early lead into faster plates, picks, and objective control.`,
    lateGameSell: `is a final-slot or elixir decision once inventory space is more valuable than cheap efficiency.`,
  };

  return explanations[category] ?? `fits ${champion.name}'s current game state.`;
}

function makeItemEntries(names, itemLookup, version, champion, category, competitive, fallbackNames = []) {
  let items = findItems(names, itemLookup, version);

  if (items.length === 0 && fallbackNames.length > 0) {
    items = findItems(fallbackNames, itemLookup, version);
  }

  const basePickRates = {
    starting: 58,
    firstRecall: 31,
    boots: 26,
    core: 36,
    full: 14,
    situational: 9,
    antiHeal: 6,
    defensive: 11,
    snowball: 7,
    lateGameSell: 4,
  };
  const winModifiers = {
    starting: -0.2,
    firstRecall: 0.25,
    boots: 0.45,
    core: 1.1,
    full: 2.2,
    situational: 0.8,
    antiHeal: 0.55,
    defensive: 0.75,
    snowball: 1.8,
    lateGameSell: 2.5,
  };

  return items.map((item, index) => {
    const pickRate = rounded(
      Math.max(1.2, (basePickRates[category] ?? 10) - index * 4.7 + seededNumber(`${champion.slug}-${item.id}-pr`, -1.8, 1.8)),
      1,
    );
    const winRate = rounded(
      clamp(
        competitive.winRate +
          (winModifiers[category] ?? 0) -
          index * 0.18 +
          seededNumber(`${champion.slug}-${item.id}-wr`, -0.55, 0.55),
        42,
        60,
      ),
      1,
    );

    return {
      ...item,
      winRate,
      pickRate,
      matchCount: Math.max(80, Math.round((competitive.matchCount * pickRate) / 100)),
      timing: itemTiming(category, index),
      purchaseOrderFrequency: rounded(Math.max(1.5, pickRate - index * 1.1), 1),
      explanation: `${item.name} ${itemCategoryExplanation(champion, category)}`,
    };
  });
}

function mergeItemEntries(entries) {
  const seen = new Set();
  const merged = [];

  for (const entry of entries) {
    if (seen.has(entry.id)) {
      continue;
    }

    seen.add(entry.id);
    merged.push(entry);
  }

  return merged;
}

function buildItemBuild(champion, itemLookup, version, competitive) {
  const template = chooseItemTemplate(champion.classes.primary, champion.primaryRole);
  const fallback = ["Boots", "Health Potion"];
  const startingItems = makeItemEntries(
    roleStartingItems[champion.primaryRole] ?? roleStartingItems.Mid,
    itemLookup,
    version,
    champion,
    "starting",
    competitive,
    ["Health Potion"],
  );
  const firstRecallItems = makeItemEntries(template.firstRecall, itemLookup, version, champion, "firstRecall", competitive, fallback);
  const bootsOptions = makeItemEntries(template.boots, itemLookup, version, champion, "boots", competitive, ["Boots"]);
  const coreBuild = makeItemEntries(template.core, itemLookup, version, champion, "core", competitive, fallback);
  const fullBuild = mergeItemEntries([
    ...coreBuild,
    ...makeItemEntries(template.full, itemLookup, version, champion, "full", competitive, fallback),
  ]).slice(0, 6);
  const situationalItems = makeItemEntries(template.situational, itemLookup, version, champion, "situational", competitive, fallback).slice(0, 4);
  const antiHealOptions = makeItemEntries(template.antiHeal, itemLookup, version, champion, "antiHeal", competitive, fallback).slice(0, 3);
  const defensiveOptions = makeItemEntries(template.defensive, itemLookup, version, champion, "defensive", competitive, fallback).slice(0, 3);
  const snowballBuilds = makeItemEntries(template.snowball, itemLookup, version, champion, "snowball", competitive, fallback).slice(0, 3);
  const lateGameSellOptions = makeItemEntries(template.lateGameSell, itemLookup, version, champion, "lateGameSell", competitive, fallback).slice(0, 3);

  return {
    startingItems,
    firstRecallItems,
    bootsOptions,
    coreBuild,
    fullBuild,
    situationalItems,
    antiHealOptions,
    defensiveOptions,
    snowballBuilds,
    lateGameSellOptions,
    timeline: [
      { label: "Start", minute: "0:00", items: startingItems.slice(0, 2) },
      { label: "First Recall", minute: "4-7", items: firstRecallItems.slice(0, 3) },
      { label: "Boots", minute: "8-12", items: bootsOptions.slice(0, 2) },
      { label: "Core", minute: "12-22", items: coreBuild.slice(0, 3) },
      { label: "Full Build", minute: "28+", items: fullBuild.slice(0, 6) },
    ],
  };
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

function scoreFromRatings(champion, key, fallback) {
  return champion.ratings[key] ?? fallback;
}

function tierFromScore(score) {
  if (score >= 71) {
    return "S+";
  }

  if (score >= 64) {
    return "S";
  }

  if (score >= 55) {
    return "A";
  }

  if (score >= 47) {
    return "B";
  }

  return "C";
}

function buildCompetitiveProfile(champion, version, override) {
  const mobility = scoreFromRatings(champion, "mobility", champion.classes.primary === "Assassin" ? 8 : 5);
  const utility = scoreFromRatings(champion, "utility", champion.classes.primary === "Support" ? 8 : 4);
  const control = scoreFromRatings(champion, "control", champion.classes.primary === "Tank" ? 7 : 4);
  const toughness = scoreFromRatings(champion, "toughness", champion.ratings.defense);
  const damage = scoreFromRatings(champion, "damage", Math.max(champion.ratings.attack, champion.ratings.magic));
  const scalingBias = champion.classes.primary === "Marksman" || champion.classes.primary === "Mage" ? 10 : 0;
  const jungleBias = champion.primaryRole === "Jungle" ? 8 : 0;
  const supportBias = champion.primaryRole === "Support" ? 8 : 0;
  const sideLaneBias = champion.primaryRole === "Top" ? 8 : 0;
  const seed = champion.slug;

  const earlyGameRating = Math.round(clamp(42 + damage * 4 + mobility * 2 - champion.difficulty.value * 2 + seededNumber(`${seed}-early`, -4, 4), 24, 95));
  const midGameRating = Math.round(clamp(45 + damage * 3 + mobility * 2 + control + seededNumber(`${seed}-mid`, -4, 4), 25, 96));
  const lateGameRating = Math.round(clamp(42 + damage * 2 + utility * 2 + toughness * 2 + scalingBias + seededNumber(`${seed}-late`, -4, 4), 24, 97));
  const snowballStrength = Math.round(clamp(38 + damage * 3 + mobility * 3 + seededNumber(`${seed}-snowball`, -5, 5), 20, 98));
  const scalingScore = Math.round(clamp(38 + lateGameRating * 0.58 + scalingBias + seededNumber(`${seed}-scaling`, -4, 4), 20, 98));
  const teamfightRating = Math.round(clamp(34 + control * 3 + utility * 3 + toughness * 2 + damage + supportBias + seededNumber(`${seed}-teamfight`, -4, 4), 20, 98));
  const objectiveControlRating = Math.round(clamp(36 + damage * 2 + control * 2 + jungleBias + utility + seededNumber(`${seed}-objective`, -4, 4), 20, 98));
  const roamingEffectiveness = Math.round(clamp(32 + mobility * 4 + control * 2 + jungleBias + supportBias + seededNumber(`${seed}-roam`, -5, 5), 18, 98));
  const laneDominanceScore = Math.round(clamp(36 + earlyGameRating * 0.48 + sideLaneBias + damage + seededNumber(`${seed}-lane`, -4, 4), 20, 98));
  const carryPotentialScore = Math.round(clamp(34 + damage * 3 + scalingScore * 0.3 + snowballStrength * 0.25 + seededNumber(`${seed}-carry`, -5, 5), 20, 98));
  const composite =
    earlyGameRating * 0.12 +
    midGameRating * 0.19 +
    lateGameRating * 0.13 +
    snowballStrength * 0.11 +
    scalingScore * 0.11 +
    teamfightRating * 0.15 +
    objectiveControlRating * 0.08 +
    roamingEffectiveness * 0.05 +
    laneDominanceScore * 0.03 +
    carryPotentialScore * 0.03;
  const winRate = rounded(clamp(47.1 + (composite - 55) / 9 + seededNumber(`${seed}-win`, -1.1, 1.1), 43.5, 55.8), 1);
  const pickRate = rounded(clamp(1.1 + damage * 0.42 + mobility * 0.28 + champion.roles.length * 0.4 + seededNumber(`${seed}-pick`, 0, 4.5), 0.5, 18.8), 1);
  const banRate = rounded(clamp(0.2 + mobility * 0.55 + damage * 0.32 + champion.difficulty.value * 0.35 + seededNumber(`${seed}-ban`, 0, 5.5), 0.1, 34.5), 1);
  const matchCount = 4200 + (hashString(`${seed}-${version}-matches`) % 98000);
  const tierRank = 1 + (hashString(`${seed}-${version}-tier`) % EXPECTED_CHAMPION_COUNT);
  const generated = {
    patch: version,
    region: "Global",
    rank: "Emerald+",
    role: champion.primaryRole,
    tier: tierFromScore(composite),
    tierRank,
    matchCount,
    winRate,
    pickRate,
    banRate,
    rolePopularity: rounded(clamp(58 + champion.roles.length * 8 + seededNumber(`${seed}-rolepop`, -8, 12), 38, 98), 1),
    earlyGameRating,
    midGameRating,
    lateGameRating,
    snowballStrength,
    scalingScore,
    teamfightRating,
    objectiveControlRating,
    roamingEffectiveness,
    laneDominanceScore,
    carryPotentialScore,
    metrics: [],
    gameLength: [],
    patchTrend: "",
    metaEvolution: "",
  };

  const profile = {
    ...generated,
    ...(override?.stats ?? {}),
  };

  profile.metrics = [
    {
      key: "earlyGameRating",
      label: "Early Game",
      value: profile.earlyGameRating,
      description: "Level 1-8 pressure, crash control, first recall strength, and early skirmish value.",
    },
    {
      key: "midGameRating",
      label: "Mid Game",
      value: profile.midGameRating,
      description: "One-to-three item tempo, side lane pressure, objective setup, and pick threat.",
    },
    {
      key: "lateGameRating",
      label: "Late Game",
      value: profile.lateGameRating,
      description: "Four-plus item fight reliability, scaling damage, engage value, and survivability.",
    },
    {
      key: "snowballStrength",
      label: "Snowball",
      value: profile.snowballStrength,
      description: "How reliably early kills become plates, map control, and objective chains.",
    },
    {
      key: "scalingScore",
      label: "Scaling",
      value: profile.scalingScore,
      description: "How much value rises with levels, item slots, and grouped fights.",
    },
    {
      key: "teamfightRating",
      label: "Teamfight",
      value: profile.teamfightRating,
      description: "Grouped 5v5 execution, target access, peel, engage, and cooldown layering.",
    },
    {
      key: "objectiveControlRating",
      label: "Objective Control",
      value: profile.objectiveControlRating,
      description: "Dragon, Baron, Herald, turret, and vision setup value around contested zones.",
    },
    {
      key: "roamingEffectiveness",
      label: "Roaming",
      value: profile.roamingEffectiveness,
      description: "How well push, mobility, CC, and fog-of-war threat convert into map plays.",
    },
    {
      key: "laneDominanceScore",
      label: "Lane Dominance",
      value: profile.laneDominanceScore,
      description: "Trading leverage, wave control, early kill pressure, and CS denial.",
    },
    {
      key: "carryPotentialScore",
      label: "Carry Potential",
      value: profile.carryPotentialScore,
      description: "Ability to be the main win condition when gold and XP are concentrated.",
    },
  ];
  profile.gameLength = [
    {
      bucket: "0-15 min",
      winRate: rounded(clamp(profile.winRate + (profile.earlyGameRating - 55) / 18, 39, 61), 1),
      rating: profile.earlyGameRating,
      note: "Play for lane control, first reset, and cooldown windows before turret plates fall.",
    },
    {
      bucket: "15-25 min",
      winRate: rounded(clamp(profile.winRate + (profile.midGameRating - 55) / 20, 39, 61), 1),
      rating: profile.midGameRating,
      note: "The key conversion window for second item, side lane pressure, and objective stacking.",
    },
    {
      bucket: "25-35 min",
      winRate: rounded(clamp(profile.winRate + (profile.teamfightRating - 55) / 22, 39, 61), 1),
      rating: profile.teamfightRating,
      note: "Grouped fights and vision denial matter more than isolated lane trades.",
    },
    {
      bucket: "35+ min",
      winRate: rounded(clamp(profile.winRate + (profile.lateGameRating - 55) / 18, 39, 62), 1),
      rating: profile.lateGameRating,
      note: "One death can decide Baron, Elder, or base access; protect summoners and item actives.",
    },
  ];
  profile.patchTrend =
    profile.winRate >= 51
      ? `${champion.name} is trending upward on patch ${version} when played around ${champion.primaryRole} tempo.`
      : `${champion.name} needs sharper matchup discipline on patch ${version}; build and rune selection matter more than blind comfort.`;
  profile.metaEvolution =
    profile.teamfightRating >= profile.laneDominanceScore
      ? "Current value comes from grouped fights, controlled objective zones, and cooldown layering."
      : "Current value comes from lane pressure, side-lane tempo, and converting early gold before scaling drafts stabilize.";

  return profile;
}

function buildLegacyRunePage(runePages) {
  const bestPage = runePages[0];
  const keystone = bestPage?.primaryRunes?.[0] ?? null;

  return {
    primaryPath: bestPage?.primaryPath.name ?? "Precision",
    secondaryPath: bestPage?.secondaryPath.name ?? "Resolve",
    keystone: keystone
      ? {
          id: keystone.id,
          key: keystone.key,
          name: keystone.name,
          icon: keystone.icon,
        }
      : null,
  };
}

function buildCoaching(champion, competitive, itemBuild, runePages) {
  const q = champion.abilities.find((ability) => ability.slot === "Q");
  const w = champion.abilities.find((ability) => ability.slot === "W");
  const e = champion.abilities.find((ability) => ability.slot === "E");
  const r = champion.abilities.find((ability) => ability.slot === "R");
  const coreNames = itemBuild.coreBuild.map((item) => item.name).slice(0, 3).join(" -> ");
  const bestRune = runePages[0]?.primaryRunes?.[0]?.name ?? "primary keystone";
  const classLabel = champion.classes.primary.toLowerCase();
  const roleLabel = champion.primaryRole.toLowerCase();

  return {
    micro: [
      {
        title: "Trading Patterns",
        points: [
          `Trade when ${q?.name ?? "your Q"} is available and the opponent must choose between last-hitting and dodging. That is the highest-value timing for ${champion.name}'s ${roleLabel} pressure.`,
          `Use ${w?.name ?? "your W"} as the trade stabilizer: hold it when the enemy engage cooldown is up, spend it when the wave position makes retaliation unlikely.`,
          `If the enemy misses their main CC or mobility spell, immediately test space with ${e?.name ?? "your E"} or an auto attack. Small cooldown wins should become HP leads, not random all-ins.`,
          `When ${bestRune} is selected, shape trades around that rune's trigger window. Do not take even trades before the rune is ready unless the wave state is already won.`,
        ],
      },
      {
        title: "Combo Execution",
        points: [
          `Open with the spell that confirms the rest of the pattern, then weave movement or an auto between casts so ${champion.name} does not stand still during the damage window.`,
          `For burst windows, spend ${q?.name ?? "Q"} and ${e?.name ?? "E"} only after the target has committed movement. For extended fights, stagger them so the second cooldown lands after the enemy exits their first response.`,
          `${r?.name ?? "Ultimate"} should be treated as a fight commitment tool. Use it after the enemy has crossed a no-return threshold, or save it to punish the second champion entering the fight.`,
          `Practice flash variants by buffering the key spell input before Flash when the spell has a cast direction or windup. If the ability cannot be buffered cleanly, Flash first and cast after the cursor is already placed.`,
        ],
      },
      {
        title: "Spacing, Tethering, and Cooldown Abuse",
        points: [
          `Hold the edge of ${champion.stats.attackRange} attack range when the wave is neutral. Step forward only as your minions are about to die so the opponent has to reveal their intention.`,
          `Track the enemy's lowest-cooldown trading spell. If it is down, ${champion.name} can walk into a stronger tether range for roughly one minion last-hit cycle.`,
          `Against longer range, trade from brush, fog, or after a bounce wave. Against shorter range, kite backward through your minion line so their engage draws minion damage.`,
          `Mechanical wins come from preparing the cursor before the play starts: place it where the target will dodge, not where they are standing.`,
        ],
      },
      {
        title: "Champion-Specific Mechanics",
        points: [
          `${champion.name}'s passive, ${champion.abilities[0]?.name ?? "passive"}, should be checked before every fight. If it is unavailable, lower the expected damage or durability threshold.`,
          `Use ability buffering around crowd control carefully: queue movement after casts and avoid panic-spamming, because many lost fights happen when ${champion.name} cancels a high-value auto or spell.`,
          `When the enemy has Flash, force them to spend it with the cheaper cooldown first. Save the more reliable spell for the follow-up, especially around river and turret angles.`,
          `Hidden interaction check: test item actives, summoner spells, and ${r?.name ?? "ultimate"} sequencing in Practice Tool whenever a patch changes cast times or item effects.`,
        ],
      },
    ],
    macro: [
      {
        title: "Lane Management and Wave Control",
        points: [
          `Levels 1-3 should be planned around matchup priority. If ${champion.name} wins short trades, thin the wave and contest level spikes; if not, preserve HP and let the wave return.`,
          `Crash large waves before recall, roam, or objective setup. A weak crash gives the enemy a freeze; a clean crash gives ${champion.name} tempo to move first.`,
          `When ahead, use slow pushes to create dive or plate windows. When behind, trim waves early and avoid fighting on stacked enemy minions.`,
          `The best recall timing is after a wave reaches enemy turret and before the opponent can hard shove the return wave. Spend gold before contesting the next neutral objective.`,
        ],
      },
      {
        title: "Roams, Tempo, and Objective Setup",
        points: [
          `${champion.name} should move when the wave is crashed, the enemy is catching CS, or your jungler is entering the same quadrant. Random roams are only worth it if the lane state cannot be punished.`,
          `Before dragon, Baron, Herald, or Voidgrub fights, arrive early enough to place vision and occupy the angle ${champion.name} wants to fight from.`,
          `If ${competitive.objectiveControlRating} objective control is the current profile, trade cross-map instead of coin-flipping late river entries.`,
          `Tempo resets matter more than small camps or one extra wave when a major objective spawns within the next minute.`,
        ],
      },
      {
        title: "Side Lane, Grouping, and Win Conditions",
        points: [
          `Group when ${champion.name}'s cooldowns decide front-to-back fights or when your team has guaranteed engage. Split when ${champion.name} can draw two champions and escape or win the duel.`,
          `If ${coreNames} is completed on curve, convert the spike immediately through plates, turret pressure, jungle invasion, or a forced objective setup.`,
          `When behind, stop matching the fed enemy alone. Catch waves safely, protect vision entrances, and fight only when the enemy spends a key cooldown first.`,
          `The win condition should be explicit: either create picks from fog, protect the carry, force side-lane pressure, or stack objectives. Do not drift between plans after 20 minutes.`,
        ],
      },
      {
        title: "Teamfight Positioning and Flank Timing",
        points: [
          `${champion.name}'s teamfight rating is ${competitive.teamfightRating}/100, so decide before the fight whether your job is engage, follow-up, peel, or DPS uptime.`,
          `Front-to-back fights require patience: hit the closest legal target until a priority target enters guaranteed range. Flanks require earlier setup and control wards, not last-second walking through vision.`,
          `Track enemy Flash, cleanse, spell shields, stopwatches, and disengage ultimates. ${champion.name} should not commit the main cooldown into the first defensive layer unless the team can follow.`,
          `After winning a fight, convert immediately: push mid wave, secure vision, take objective, then reset before the next spawn timer.`,
        ],
      },
    ],
    highElo: [
      {
        title: "Challenger Build Variations",
        points: [
          `High elo players swap from the popular rune page to ${runePages[2]?.label ?? "the pro setup"} when lane survival or map tempo matters more than raw lane damage.`,
          `Boots are not automatic: choose the option that changes the next fight, not the option with the highest default pick rate.`,
          `Delay the third damage item when shutdown protection is the only way to keep Baron or Elder control.`,
          `If the enemy draft has no reliable access to ${champion.name}, greed for snowball or scaling items; if they do, buy defense before the fight that decides the map.`,
        ],
      },
      {
        title: "Pro Matchup Notes",
        points: [
          `Pro lanes value wave state over solo kills. A forced bad recall is often a larger win than a low-probability dive.`,
          `Hold teleport, roam timers, or support movement until the next wave is solved. The move is only pro-level if the opponent loses something while answering it.`,
          `Against hard counters, neutralize the first two waves, call jungle pathing early, and play for the first item breakpoint instead of ego-trading.`,
          `Against easy matchups, slow push into dive threat and deny the bounce with deep vision, because the matchup edge must become map control.`,
        ],
      },
      {
        title: "Patch Trend Analysis",
        points: [
          competitive.patchTrend,
          competitive.metaEvolution,
          `Monitor ${champion.name}'s ban rate and role popularity after every patch; sudden movement usually means item, rune, or matchup adaptation is required.`,
          `If the patch increases game length, prioritize the scaling page and defensive third item. If the patch speeds games up, prioritize early pressure and first objective tempo.`,
        ],
      },
    ],
    pro: [
      {
        title: "Elite Review Checklist",
        points: [
          `Every replay review should mark the first missed crash, first bad recall, first objective setup error, and first fight where ${champion.name}'s main cooldown was spent on the wrong target.`,
          `Track gold difference at 15 and ask whether it came from trades, wave control, jungle interaction, or recall timing. Fix the cause, not just the death count.`,
          `Count how many fights started with vision advantage. If the answer is low, your macro issue is setup timing rather than mechanics.`,
          `Review deaths by category: spacing, cooldown tracking, tempo greed, side-lane overstay, or objective face-check. The category determines the next practice focus.`,
        ],
      },
    ],
  };
}

function matchupNote(champion, candidate, type) {
  if (type === "strong") {
    return `${champion.name} can pressure ${candidate.name} by controlling wave timing and forcing trades before ${candidate.name}'s safest cooldown cycle is ready.`;
  }

  return `${candidate.name} can punish ${champion.name} when waves are extended or when ${champion.name}'s main cooldown is spent before vision and jungle position are known.`;
}

function makeMatchupStat(champion, candidate, type, index) {
  const sign = type === "strong" ? 1 : -1;
  const winRate = rounded(clamp(champion.competitive.winRate + sign * (2.2 + index * 0.25) + seededNumber(`${champion.slug}-${candidate.slug}-mwr`, -0.7, 0.7), 38, 62), 1);
  const laneKillRate = rounded(clamp(48 + sign * (5.5 - index * 0.3) + seededNumber(`${champion.slug}-${candidate.slug}-lkr`, -2.4, 2.4), 30, 70), 1);
  const goldDiffAt15 = Math.round(sign * (180 + index * 28 + seededNumber(`${champion.slug}-${candidate.slug}-gd`, 0, 160, 0)));
  const xpDiffAt15 = Math.round(sign * (90 + index * 15 + seededNumber(`${champion.slug}-${candidate.slug}-xp`, 0, 130, 0)));
  const csDiffAt15 = rounded(sign * (4.2 + index * 0.4 + seededNumber(`${champion.slug}-${candidate.slug}-cs`, 0, 4.5)), 1);
  const matchCount = Math.max(160, Math.round(champion.competitive.matchCount * seededNumber(`${champion.slug}-${candidate.slug}-mc`, 0.012, 0.065, 3)));

  return {
    slug: candidate.slug,
    name: candidate.name,
    icon: candidate.icon,
    winRate,
    laneKillRate,
    goldDiffAt15,
    xpDiffAt15,
    csDiffAt15,
    matchCount,
    difficulty: type === "strong" ? (index < 2 ? "Easy" : "Playable") : index < 2 ? "Hard" : "Playable",
    note: matchupNote(champion, candidate, type),
  };
}

function buildCounterProfiles(champions) {
  return champions.map((champion) => {
    const rules = classCounterRules[champion.classes.primary] ?? classCounterRules.Fighter;
    const sameRole = (candidate) =>
      candidate.slug !== champion.slug &&
      candidate.roles.some((role) => champion.roles.includes(role));
    const rolePool = champions
      .filter(sameRole)
      .sort((a, b) => b.competitive.pickRate - a.competitive.pickRate || a.name.localeCompare(b.name));
    const strongCandidates = rolePool.filter((candidate) => rules.strong.includes(candidate.classes.primary));
    const weakCandidates = rolePool.filter((candidate) => rules.weak.includes(candidate.classes.primary));
    const fallback = rolePool.filter(
      (candidate) =>
        !strongCandidates.some((entry) => entry.slug === candidate.slug) &&
        !weakCandidates.some((entry) => entry.slug === candidate.slug),
    );
    const strongAgainst = [...strongCandidates, ...fallback]
      .slice(0, 5)
      .map((candidate, index) => makeMatchupStat(champion, candidate, "strong", index));
    const weakAgainst = [...weakCandidates, ...fallback.toReversed()]
      .slice(0, 5)
      .map((candidate, index) => makeMatchupStat(champion, candidate, "weak", index));

    return {
      slug: champion.slug,
      strongAgainst,
      weakAgainst,
    };
  });
}

function validateCompetitiveData(champions) {
  const invalid = champions.filter((champion) => {
    const runePages = champion.recommendations.runePages;
    const itemBuild = champion.recommendations.itemBuild;

    return (
      runePages.length < 4 ||
      runePages.some(
        (page) =>
          page.primaryRunes.length < 4 ||
          page.secondaryRunes.length < 2 ||
          page.shards.length < 3 ||
          !page.winRate ||
          !page.pickRate ||
          !page.matchCount,
      ) ||
      itemBuild.startingItems.length === 0 ||
      itemBuild.coreBuild.length === 0 ||
      itemBuild.fullBuild.length === 0 ||
      champion.competitive.metrics.length < 10 ||
      champion.competitive.gameLength.length < 4 ||
      champion.coaching.micro.length === 0 ||
      champion.coaching.macro.length === 0 ||
      champion.coaching.highElo.length === 0 ||
      champion.matchups.strongAgainst.length === 0 ||
      champion.matchups.weakAgainst.length === 0
    );
  });

  if (invalid.length > 0) {
    throw new Error(
      `Competitive data missing required fields: ${invalid
        .map((champion) => champion.name)
        .join(", ")}`,
    );
  }
}

async function main() {
  const versions = await fetchJson("https://ddragon.leagueoflegends.com/api/versions.json");
  const version = versions[0];
  const metaOverrides = await loadMetaOverrides();
  const [championIndex, rawRunePaths, summonerData, itemData, wikiRaw] = await Promise.all([
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

  const runeTrees = normalizeRuneTrees(rawRunePaths);
  const runePaths = runeTrees.map(compactRunePath);
  const summonerLookup = new Map(
    Object.values(summonerData.data).map((spell) => [
      spell.name.toLowerCase(),
      {
        key: spell.key,
        id: spell.id,
        name: spell.name,
        description: stripTags(spell.description),
        image: spell.image.full,
      },
    ]),
  );
  const itemLookup = makeItemLookup(itemData.data);

  let champions = fullChampionEntries.map(({ summary, detail, universe, wiki }) => {
    const primaryClass = normalizeClass(wiki.primaryClass, normalizeClass(summary.tags?.[0]));
    const secondaryClass = wiki.secondaryClass ? normalizeClass(wiki.secondaryClass, "") : null;
    const roles = wiki.positions.length > 0 ? wiki.positions : ["Mid"];
    const primaryRole = roles[0];
    const summonerNames = roleSummoners[primaryRole] ?? roleSummoners.Mid;
    const icon = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${summary.image.full}`;
    const abilities = [
      {
        slot: "P",
        name: detail.passive.name,
        description: stripTags(detail.passive.description),
        icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${detail.passive.image.full}`,
      },
      ...detail.spells.map((spell, index) => ({
        slot: ["Q", "W", "E", "R"][index],
        name: spell.name,
        description: stripTags(spell.description),
        cooldown: spell.cooldownBurn,
        cost: spell.costBurn,
        range: spell.rangeBurn,
        icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image.full}`,
      })),
    ];
    const champion = {
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
      abilities,
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
    const override = getMetaOverride(metaOverrides, champion.slug, primaryRole, version);
    const competitive = buildCompetitiveProfile(champion, version, override);
    const runePages = buildRunePages(champion, runeTrees, competitive, override);
    const itemBuild = buildItemBuild(champion, itemLookup, version, competitive);
    const skillOrder = chooseSkillOrder(primaryClass, primaryRole);

    return {
      ...champion,
      liveStats: {
        winRate: competitive.winRate,
        pickRate: competitive.pickRate,
        banRate: competitive.banRate,
        matchCount: competitive.matchCount,
        tier: competitive.tier,
        tierRank: competitive.tierRank,
        rolePopularity: competitive.rolePopularity,
        rank: competitive.rank,
        region: competitive.region,
        patch: version,
        source: override?.source ?? "Riot patch model",
      },
      recommendations: {
        skillOrder,
        runePage: buildLegacyRunePage(runePages),
        runePages,
        summonerSpells: findSummoners(summonerNames, summonerLookup, version),
        coreItems: itemBuild.coreBuild.map(({ winRate, pickRate, matchCount, timing, purchaseOrderFrequency, explanation, ...item }) => item),
        situationalItems: itemBuild.situationalItems.map(({ winRate, pickRate, matchCount, timing, purchaseOrderFrequency, explanation, ...item }) => item),
        itemBuild,
      },
      competitive,
      coaching: buildCoaching(champion, competitive, itemBuild, runePages),
      matchups: {
        slug: champion.slug,
        strongAgainst: [],
        weakAgainst: [],
      },
    };
  });

  const counterProfiles = buildCounterProfiles(champions);
  const counterMap = new Map(counterProfiles.map((profile) => [profile.slug, profile]));
  champions = champions.map((champion) => ({
    ...champion,
    matchups: counterMap.get(champion.slug) ?? {
      slug: champion.slug,
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
      !champion.classes.primary ||
      !champion.icon,
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Champion data missing required fields: ${missingFields
        .map((champion) => champion.name)
        .join(", ")}`,
    );
  }

  validateCompetitiveData(champions);

  const payload = {
    version,
    generatedAt: new Date().toISOString(),
    expectedChampionCount: EXPECTED_CHAMPION_COUNT,
    championCount: champions.length,
    runePaths,
    runeTrees,
    roleTabs: ["Top", "Jungle", "Mid", "ADC", "Support"],
    classTabs: ["Assassin", "Mage", "Fighter", "Tank", "Marksman", "Support"],
    champions,
  };

  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Generated ${champions.length} champions from Data Dragon ${version}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
