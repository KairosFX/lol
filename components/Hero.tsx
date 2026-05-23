import Link from "next/link";
import { ArrowRight, BarChart3, Database, Search } from "lucide-react";
import { ChampionCard } from "@/components/ChampionCard";
import type { ChampionSummary } from "@/lib/types";

type HeroProps = {
  championCount: number;
  dataVersion: string;
  dataGeneratedAt: string;
  featuredChampions: ChampionSummary[];
};

function formatSyncDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function Hero({
  championCount,
  dataVersion,
  dataGeneratedAt,
  featuredChampions,
}: HeroProps) {
  const heroChampion = featuredChampions[0];

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {heroChampion ? (
        <img
          src={heroChampion.images.splash}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-45"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,8,18,0.98)_0%,rgba(5,8,18,0.82)_42%,rgba(5,8,18,0.48)_68%,rgba(5,8,18,0.9)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_0%,rgba(5,8,18,0.92)_100%)]" />

      <div className="rift-shell grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div className="max-w-3xl">
          <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.98] text-white md:text-7xl">
            League Competitive Intelligence
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Search every champion through a statistics-first platform for rune pages, item timing,
            matchup data, advanced power curves, and pro-level micro and macro optimization.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#champions"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brightgold px-5 text-sm font-bold text-abyss transition hover:bg-white"
            >
              <Search aria-hidden="true" size={18} />
              Search the meta
            </Link>
            <Link
              href="/champions"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/[0.14] bg-white/[0.07] px-5 text-sm font-semibold text-white transition hover:border-arcane/50 hover:bg-arcane/10"
            >
              Open library
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <p className="text-3xl font-black text-white">{championCount}</p>
              <p className="mt-1 text-sm text-slate-400">Champion hubs</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <Database aria-hidden="true" className="text-brightgold" size={24} />
              <p className="mt-3 text-sm font-semibold text-white">Patch {dataVersion}</p>
              <p className="mt-1 text-xs text-slate-500">Updated {formatSyncDate(dataGeneratedAt)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <BarChart3 aria-hidden="true" className="text-arcane" size={24} />
              <p className="mt-3 text-sm font-semibold text-white">Runes, builds, matchups</p>
              <p className="mt-1 text-xs text-slate-500">Statistics-first pages</p>
            </div>
          </div>
        </div>

        <div className="glass-panel gold-stroke rounded-lg p-4 lg:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Trending Champion Hubs</h2>
              <p className="mt-1 text-sm text-slate-400">Fast access to complete profiles</p>
            </div>
            <span className="rounded-md border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-brightgold">
              172 total
            </span>
          </div>
          <div className="grid gap-3">
            {featuredChampions.slice(0, 5).map((champion) => (
              <ChampionCard key={champion.slug} champion={champion} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
