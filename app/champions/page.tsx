import type { Metadata } from "next";
import { ChampionSearch } from "@/components/ChampionSearch";
import { SiteHeader } from "@/components/SiteHeader";
import { championDatabase, getChampionSummaries, getFeaturedChampions } from "@/lib/champions";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Champion Meta Library",
  description:
    "Search and filter all 172 League of Legends champions by role, class, tier, lane, patch, rank, win rate, and matchup profile.",
};

export default function ChampionsPage() {
  const champions = getChampionSummaries();
  const featuredChampions = getFeaturedChampions();
  const regions = [...new Set(champions.map((champion) => champion.region))].sort();

  return (
    <>
      <SiteHeader championCount={championDatabase.championCount} />
      <main className="pb-10">
        <section className="rift-shell py-10 md:py-14">
          <h1 className="max-w-3xl text-4xl font-black text-white md:text-6xl">
            Champion Meta Library
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            A complete index of all 172 champions with tier filters, rune pages, build paths,
            advanced statistics, matchup data, and high-elo coaching notes.
          </p>
        </section>
        <ChampionSearch
          champions={champions}
          featuredChampions={featuredChampions}
          roleTabs={championDatabase.roleTabs}
          classTabs={championDatabase.classTabs}
          regions={regions}
          title="All Champions"
        />
      </main>
    </>
  );
}
