import { ChampionSearch } from "@/components/ChampionSearch";
import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllChampions, getFeaturedChampions } from "@/lib/champions";

export const dynamic = "force-static";

export default async function Home() {
  const champions = await getAllChampions();
  const featuredChampions = getFeaturedChampions(champions);

  return (
    <>
      <SiteHeader championCount={champions.length} />
      <main>
        <Hero championCount={champions.length} featuredChampions={featuredChampions} />
        <ChampionSearch champions={champions} featuredChampions={featuredChampions} />
      </main>
    </>
  );
}
