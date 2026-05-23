import Link from "next/link";
import { ArrowRight, BookOpen, Search, Shield } from "lucide-react";
import { ChampionCard } from "@/components/ChampionCard";
import type { ChampionMeta } from "@/lib/types";

type HeroProps = {
  championCount: number;
  featuredChampions: ChampionMeta[];
};

export function Hero({ championCount, featuredChampions }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(200,168,95,0.13),transparent_32%,rgba(45,212,191,0.10)_68%,transparent)]" />
      <div className="rift-shell grid min-h-[calc(100vh-4rem)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div className="max-w-3xl">
          <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.95] text-white md:text-7xl">
            League Guide Codex
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A searchable champion wiki generated directly from the local guide archive. Browse
            every matchup note, rune setup, item path, lane plan, and teamfight reminder without
            hardcoded champion data.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#champions"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brightgold px-5 text-sm font-bold text-abyss transition hover:bg-white"
            >
              <Search aria-hidden="true" size={18} />
              Search guides
            </Link>
            <Link
              href="/champions"
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/[0.14] bg-white/[0.07] px-5 text-sm font-semibold text-white transition hover:border-arcane/50 hover:bg-arcane/10"
            >
              Browse champions
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <p className="text-3xl font-black text-white">{championCount}</p>
              <p className="mt-1 text-sm text-slate-400">Champion guides</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <BookOpen aria-hidden="true" className="text-brightgold" size={24} />
              <p className="mt-3 text-sm font-semibold text-white">Static pages</p>
              <p className="mt-1 text-xs text-slate-500">Generated from text files</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <Shield aria-hidden="true" className="text-arcane" size={24} />
              <p className="mt-3 text-sm font-semibold text-white">Fuzzy search</p>
              <p className="mt-1 text-xs text-slate-500">Fast keyboard navigation</p>
            </div>
          </div>
        </div>

        <div className="glass-panel gold-stroke rounded-lg p-4 lg:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Featured Champions</h2>
              <p className="mt-1 text-sm text-slate-400">Deterministic picks from the archive</p>
            </div>
            <span className="rounded-md border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-brightgold">
              Live index
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
