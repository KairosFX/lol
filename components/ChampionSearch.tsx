"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ChampionCard } from "@/components/ChampionCard";
import { ClassBadge, RoleBadge } from "@/components/GameBadges";
import type { ChampionClassName, ChampionSummary, DifficultyLabel, RoleName } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChampionSearchProps = {
  champions: ChampionSummary[];
  featuredChampions?: ChampionSummary[];
  roleTabs: RoleName[];
  classTabs: ChampionClassName[];
  regions: string[];
  title?: string;
};

type SortKey = "name" | "releaseDate" | "popularity" | "winRate";
type FilterValue<T extends string> = "All" | T;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function fuzzyScore(champion: ChampionSummary, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return 1;
  }

  const normalizedQuery = normalize(query);
  const normalizedName = normalize(champion.name);
  const normalizedTitle = normalize(champion.title);
  const normalizedSlug = normalize(champion.slug);

  if (normalizedName === normalizedQuery || normalizedSlug === normalizedQuery) {
    return 1000;
  }

  if (normalizedName.startsWith(normalizedQuery) || normalizedSlug.startsWith(normalizedQuery)) {
    return 850 - normalizedName.length;
  }

  if (
    normalizedName.includes(normalizedQuery) ||
    normalizedTitle.includes(normalizedQuery) ||
    champion.searchText.includes(query)
  ) {
    return 650 - Math.max(0, normalizedName.indexOf(normalizedQuery));
  }

  let queryIndex = 0;
  let score = 0;

  for (let nameIndex = 0; nameIndex < normalizedName.length; nameIndex += 1) {
    if (normalizedName[nameIndex] === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      score += 8;
    } else {
      score -= 1;
    }

    if (queryIndex === normalizedQuery.length) {
      return 420 + score;
    }
  }

  return 0;
}

function sortChampions(champions: ChampionSummary[], sortKey: SortKey) {
  return [...champions].sort((a, b) => {
    if (sortKey === "releaseDate") {
      return Date.parse(b.releaseDate) - Date.parse(a.releaseDate) || a.name.localeCompare(b.name);
    }

    if (sortKey === "winRate") {
      return (
        (b.liveStats.winRate ?? -1) - (a.liveStats.winRate ?? -1) ||
        a.name.localeCompare(b.name)
      );
    }

    if (sortKey === "popularity") {
      return (
        (b.liveStats.pickRate ?? -1) - (a.liveStats.pickRate ?? -1) ||
        a.name.localeCompare(b.name)
      );
    }

    return a.name.localeCompare(b.name);
  });
}

export function ChampionSearch({
  champions,
  featuredChampions = [],
  roleTabs,
  classTabs,
  regions,
  title = "Champion Library",
}: ChampionSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [roleFilter, setRoleFilter] = useState<FilterValue<RoleName>>("All");
  const [classFilter, setClassFilter] = useState<FilterValue<ChampionClassName>>("All");
  const [difficultyFilter, setDifficultyFilter] =
    useState<FilterValue<DifficultyLabel>>("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const deferredQuery = useDeferredValue(query);

  const filteredChampions = useMemo(() => {
    const scored = champions
      .map((champion) => ({
        champion,
        score: fuzzyScore(champion, deferredQuery),
      }))
      .filter(({ champion, score }) => {
        const matchesQuery = score > 0;
        const matchesRole = roleFilter === "All" || champion.roles.includes(roleFilter);
        const matchesClass =
          classFilter === "All" ||
          champion.classes.primary === classFilter ||
          champion.classes.secondary === classFilter;
        const matchesDifficulty =
          difficultyFilter === "All" || champion.difficulty.label === difficultyFilter;
        const matchesRegion = regionFilter === "All" || champion.region === regionFilter;

        return (
          matchesQuery &&
          matchesRole &&
          matchesClass &&
          matchesDifficulty &&
          matchesRegion
        );
      });

    if (deferredQuery.trim()) {
      return scored
        .sort((a, b) => b.score - a.score || a.champion.name.localeCompare(b.champion.name))
        .map((entry) => entry.champion);
    }

    return sortChampions(
      scored.map((entry) => entry.champion),
      sortKey,
    );
  }, [
    champions,
    classFilter,
    deferredQuery,
    difficultyFilter,
    regionFilter,
    roleFilter,
    sortKey,
  ]);

  const hasQuery = query.trim().length > 0;
  const hasFilters =
    roleFilter !== "All" ||
    classFilter !== "All" ||
    difficultyFilter !== "All" ||
    regionFilter !== "All" ||
    sortKey !== "name";
  const resultLabel = `${filteredChampions.length} ${
    filteredChampions.length === 1 ? "champion" : "champions"
  }`;
  const liveSortUnavailable =
    (sortKey === "winRate" || sortKey === "popularity") &&
    champions.every((champion) =>
      sortKey === "winRate" ? champion.liveStats.winRate === null : champion.liveStats.pickRate === null,
    );

  function resetFilters() {
    setQuery("");
    setRoleFilter("All");
    setClassFilter("All");
    setDifficultyFilter("All");
    setRegionFilter("All");
    setSortKey("name");
    setActiveIndex(0);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, filteredChampions.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && filteredChampions[activeIndex]) {
      event.preventDefault();
      router.push(`/champions/${filteredChampions[activeIndex].slug}`);
    }

    if (event.key === "Escape") {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.blur();
    }
  }

  return (
    <section id="champions" className="rift-shell py-10 md:py-14">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Search champion names, regions, roles, classes, resources, and official titles.
          </p>
        </div>
        <p className="text-sm text-slate-400">{resultLabel}</p>
      </div>

      <div className="glass-panel gold-stroke sticky top-20 z-20 rounded-lg p-3">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={20}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="focus-ring h-14 w-full rounded-lg border border-white/10 bg-abyss/80 pl-12 pr-12 text-base text-white placeholder:text-slate-500"
            placeholder="Search Ahri, jungle, mage, Demacia..."
            aria-label="Search champions"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              className="focus-ring absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X aria-hidden="true" size={18} />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            className={cn(
              "focus-ring shrink-0 rounded-md border px-3 py-2 text-sm font-semibold transition",
              roleFilter === "All"
                ? "border-brightgold/60 bg-brightgold/15 text-brightgold"
                : "border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:text-white",
            )}
            onClick={() => {
              setRoleFilter("All");
              setActiveIndex(0);
            }}
          >
            All Roles
          </button>
          {roleTabs.map((role) => (
            <button
              key={role}
              type="button"
              className="focus-ring shrink-0 rounded-md"
              onClick={() => {
                setRoleFilter(role);
                setActiveIndex(0);
              }}
            >
              <RoleBadge role={role} selected={roleFilter === role} />
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto]">
          <div className="flex flex-wrap gap-1.5">
            {classTabs.map((championClass) => (
              <button
                key={championClass}
                type="button"
                className="focus-ring rounded-md"
                onClick={() => {
                  setClassFilter((current) =>
                    current === championClass ? "All" : championClass,
                  );
                  setActiveIndex(0);
                }}
              >
                <ClassBadge
                  championClass={championClass}
                  compact
                  secondary={classFilter !== championClass}
                />
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="difficulty-filter">
            Difficulty
          </label>
          <select
            id="difficulty-filter"
            value={difficultyFilter}
            onChange={(event) => {
              setDifficultyFilter(event.target.value as FilterValue<DifficultyLabel>);
              setActiveIndex(0);
            }}
            className="focus-ring h-10 rounded-md border border-white/10 bg-abyss px-3 text-sm text-slate-200"
          >
            <option value="All">All difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <label className="sr-only" htmlFor="region-filter">
            Region
          </label>
          <select
            id="region-filter"
            value={regionFilter}
            onChange={(event) => {
              setRegionFilter(event.target.value);
              setActiveIndex(0);
            }}
            className="focus-ring h-10 rounded-md border border-white/10 bg-abyss px-3 text-sm text-slate-200"
          >
            <option value="All">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="sort-filter">
            Sort champions
          </label>
          <select
            id="sort-filter"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="focus-ring h-10 rounded-md border border-white/10 bg-abyss px-3 text-sm text-slate-200"
          >
            <option value="name">Sort A-Z</option>
            <option value="releaseDate">Newest releases</option>
            <option value="popularity">Popularity</option>
            <option value="winRate">Win rate</option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.09] hover:text-white"
          >
            <SlidersHorizontal aria-hidden="true" size={16} />
            Reset
          </button>
        </div>

        {liveSortUnavailable ? (
          <p className="mt-3 text-xs text-slate-500">
            Live win, pick, and ban rates are not connected, so this sort falls back to champion
            name.
          </p>
        ) : null}
      </div>

      {!hasQuery && !hasFilters && featuredChampions.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase text-slate-300">Newest Champions</h3>
            <span className="text-xs text-slate-500">Official data sync</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {featuredChampions.map((champion) => (
              <ChampionCard key={champion.slug} champion={champion} compact />
            ))}
          </div>
        </div>
      ) : null}

      {filteredChampions.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChampions.map((champion, index) => (
            <div
              key={champion.slug}
              className={cn(
                "rounded-lg transition",
                hasQuery && index === activeIndex && "ring-2 ring-arcane/50 ring-offset-2 ring-offset-abyss",
              )}
            >
              <ChampionCard champion={champion} />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel mt-8 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-white">No champions found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Try a shorter query or clear one of the active role, class, difficulty, or region
            filters.
          </p>
        </div>
      )}
    </section>
  );
}
