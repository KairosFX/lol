"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { ChampionCard } from "@/components/ChampionCard";
import type { ChampionMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChampionSearchProps = {
  champions: ChampionMeta[];
  featuredChampions?: ChampionMeta[];
  title?: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function fuzzyScore(champion: ChampionMeta, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return 1;
  }

  const normalizedQuery = normalize(query);
  const normalizedName = normalize(champion.name);
  const normalizedSlug = normalize(champion.slug);

  if (normalizedName === normalizedQuery || normalizedSlug === normalizedQuery) {
    return 1000;
  }

  if (normalizedName.startsWith(normalizedQuery) || normalizedSlug.startsWith(normalizedQuery)) {
    return 850 - normalizedName.length;
  }

  if (normalizedName.includes(normalizedQuery) || champion.searchText.includes(query)) {
    return 650 - normalizedName.indexOf(normalizedQuery);
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

export function ChampionSearch({
  champions,
  featuredChampions = [],
  title = "Champion Library",
}: ChampionSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const filteredChampions = useMemo(() => {
    const scored = champions
      .map((champion) => ({
        champion,
        score: fuzzyScore(champion, deferredQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.champion.name.localeCompare(b.champion.name))
      .map((entry) => entry.champion);

    return deferredQuery.trim() ? scored : [...champions];
  }, [champions, deferredQuery]);

  const hasQuery = query.trim().length > 0;
  const resultLabel = `${filteredChampions.length} ${filteredChampions.length === 1 ? "guide" : "guides"}`;

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
            Search by champion, role, lane identity, build section, or guide text.
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
            placeholder="Search Aatrox, jungle, runes, matchups..."
            aria-label="Search champion guides"
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
      </div>

      {!hasQuery && featuredChampions.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase text-slate-300">Featured Guides</h3>
            <span className="text-xs text-slate-500">Generated from the local archive</span>
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
            Try a shorter query, a lane identity, a role, or a guide topic such as runes,
            combos, or matchups.
          </p>
        </div>
      )}
    </section>
  );
}
