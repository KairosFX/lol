import { ChampionSearch } from "@/components/ChampionSearch";
import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";
import { championDatabase, getChampionSummaries, getFeaturedChampions } from "@/lib/champions";

export const dynamic = "force-static";

export default function Home() {
  const champions = getChampionSummaries();
  const featuredChampions = getFeaturedChampions();
  const regions = [...new Set(champions.map((champion) => champion.region))].sort();

  return (
    <>
      <SiteHeader championCount={championDatabase.championCount} />
      <main>
        <Hero
          championCount={championDatabase.championCount}
          dataVersion={championDatabase.version}
          featuredChampions={featuredChampions}
        />
        <ChampionSearch
          champions={champions}
          featuredChampions={featuredChampions}
          roleTabs={championDatabase.roleTabs}
          classTabs={championDatabase.classTabs}
          regions={regions}
        />
      </main>
    </>
  );
}
