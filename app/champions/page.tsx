import type { Metadata } from "next";
import { ChampionSearch } from "@/components/ChampionSearch";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllChampions, getFeaturedChampions } from "@/lib/champions";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Champion Index",
  description:
    "Search every League of Legends champion guide generated from the local guide text archive.",
};

export default async function ChampionsPage() {
  const champions = await getAllChampions();
  const featuredChampions = getFeaturedChampions(champions);

  return (
    <>
      <SiteHeader championCount={champions.length} />
      <main className="pb-10">
        <section className="rift-shell py-10 md:py-14">
          <h1 className="max-w-3xl text-4xl font-black text-white md:text-6xl">Champion Index</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Every guide is discovered from the text archive and sorted alphabetically.
          </p>
        </section>
        <ChampionSearch
          champions={champions}
          featuredChampions={featuredChampions}
          title="All Champion Guides"
        />
      </main>
    </>
  );
}
