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
}

validateChampionDatabase(championDatabase);

const champions = [...championDatabase.champions].sort((a, b) => a.name.localeCompare(b.name));
const championBySlug = new Map(champions.map((champion) => [champion.slug, champion]));

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
      sources: _sources,
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
      const releaseSort = Date.parse(b.releaseDate) - Date.parse(a.releaseDate);
      return releaseSort || a.name.localeCompare(b.name);
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
