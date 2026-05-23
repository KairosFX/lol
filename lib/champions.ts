import databaseJson from "@/data/champion-database.json";
import type { ChampionDatabase, ChampionRecord, ChampionSummary } from "@/lib/types";

export const EXPECTED_CHAMPION_COUNT = 172;

export const championDatabase = databaseJson as ChampionDatabase;

function validateChampionDatabase(database: ChampionDatabase) {
  if (database.expectedChampionCount !== EXPECTED_CHAMPION_COUNT) {
    throw new Error(
      `Champion database expected count drifted: ${database.expectedChampionCount}`,
    );
  }

  if (
    database.championCount !== EXPECTED_CHAMPION_COUNT ||
    database.champions.length !== EXPECTED_CHAMPION_COUNT
  ) {
    throw new Error(
      `Expected ${EXPECTED_CHAMPION_COUNT} champions, found ${database.champions.length}`,
    );
  }

  const slugs = new Set<string>();
  const duplicates: string[] = [];

  for (const champion of database.champions) {
    if (slugs.has(champion.slug)) {
      duplicates.push(champion.slug);
    }

    slugs.add(champion.slug);
  }

  if (duplicates.length > 0) {
    throw new Error(`Duplicate champion slugs: ${duplicates.join(", ")}`);
  }

  if (database.runeTrees.length !== 5) {
    throw new Error(`Expected 5 rune trees, found ${database.runeTrees.length}`);
  }

  const incompleteChampions = database.champions.filter((champion) => {
    const runePages = champion.recommendations.runePages;
    const itemBuild = champion.recommendations.itemBuild;

    return (
      runePages.length < 4 ||
      runePages.some(
        (page) =>
          page.primaryRunes.length < 4 ||
          page.secondaryRunes.length < 2 ||
          page.shards.length < 3 ||
          !page.matchCount,
      ) ||
      itemBuild.startingItems.length === 0 ||
      itemBuild.coreBuild.length === 0 ||
      itemBuild.fullBuild.length === 0 ||
      champion.competitive.metrics.length < 10 ||
      champion.competitive.gameLength.length < 4 ||
      champion.coaching.micro.length === 0 ||
      champion.coaching.macro.length === 0 ||
      champion.matchups.strongAgainst.length === 0 ||
      champion.matchups.weakAgainst.length === 0
    );
  });

  if (incompleteChampions.length > 0) {
    throw new Error(
      `Incomplete competitive data: ${incompleteChampions
        .map((champion) => champion.name)
        .join(", ")}`,
    );
  }
}

validateChampionDatabase(championDatabase);

const champions = [...championDatabase.champions].sort((a, b) => a.name.localeCompare(b.name));
const championBySlug = new Map(champions.map((champion) => [champion.slug, champion]));
const tierOrder: Record<string, number> = {
  "S+": 5,
  S: 4,
  A: 3,
  B: 2,
  C: 1,
};

export function getAllChampions(): ChampionRecord[] {
  return champions;
}

export function getChampionSummaries(): ChampionSummary[] {
  return champions.map(
    ({
      lore: _lore,
      releasePatch: _releasePatch,
      ratings: _ratings,
      stats: _stats,
      abilities: _abilities,
      recommendations: _recommendations,
      competitive: _competitive,
      coaching: _coaching,
      matchups: _matchups,
      ...summary
    }) => summary,
  );
}

export function getChampionBySlug(slug: string): ChampionRecord | null {
  return championBySlug.get(slug) ?? null;
}

export function getFeaturedChampions(count = 6): ChampionSummary[] {
  return [...getChampionSummaries()]
    .sort((a, b) => {
      const tierSort =
        (tierOrder[b.liveStats.tier ?? ""] ?? -1) -
        (tierOrder[a.liveStats.tier ?? ""] ?? -1);
      const pickSort = (b.liveStats.pickRate ?? -1) - (a.liveStats.pickRate ?? -1);
      const winSort = (b.liveStats.winRate ?? -1) - (a.liveStats.winRate ?? -1);

      return tierSort || pickSort || winSort || a.name.localeCompare(b.name);
    })
    .slice(0, count);
}

export function getRelatedChampions(
  champion: ChampionRecord,
  count = 4,
): ChampionSummary[] {
  const championRoles = new Set(champion.roles);
  const championClasses = new Set(
    [champion.classes.primary, champion.classes.secondary].filter(Boolean),
  );

  return getChampionSummaries()
    .filter((candidate) => candidate.slug !== champion.slug)
    .map((candidate) => {
      const roleScore = candidate.roles.filter((role) => championRoles.has(role)).length * 4;
      const classScore =
        [candidate.classes.primary, candidate.classes.secondary].filter(
          (championClass) => championClass && championClasses.has(championClass),
        ).length * 3;
      const regionScore = candidate.region === champion.region ? 1 : 0;

      return {
        champion: candidate,
        score: roleScore + classScore + regionScore,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.champion.name.localeCompare(b.champion.name))
    .slice(0, count)
    .map((entry) => entry.champion);
}
