import type { Metadata } from "next";
import { ChampionSearch } from "@/components/ChampionSearch";
import { SiteHeader } from "@/components/SiteHeader";
import { championDatabase, getChampionSummaries, getFeaturedChampions } from "@/lib/champions";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Champion Library",
  description:
    "Search and filter all 172 League of Legends champions by role, class, region, difficulty, and release date.",
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
            Champion Library
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            A complete static index of all 172 champions with role, class, region, release,
            resource, build, rune, and ability data.
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
