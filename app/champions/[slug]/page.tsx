import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChampionProfile } from "@/components/ChampionProfile";
import { SiteHeader } from "@/components/SiteHeader";
import {
  championDatabase,
  getAllChampions,
  getChampionBySlug,
  getRelatedChampions,
} from "@/lib/champions";

type ChampionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllChampions().map((champion) => ({
    slug: champion.slug,
  }));
}

export async function generateMetadata({ params }: ChampionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const champion = getChampionBySlug(slug);

  if (!champion) {
    return {
      title: "Champion Not Found",
    };
  }

  const description = `${champion.name} champion profile with roles, class, region, abilities, runes, items, stats, matchups, and release data.`;

  return {
    title: `${champion.name} Champion Database`,
    description,
    alternates: {
      canonical: `/champions/${champion.slug}`,
    },
    openGraph: {
      title: `${champion.name} Champion Database`,
      description,
      type: "article",
      url: `/champions/${champion.slug}`,
      images: [
        {
          url: champion.images.splash,
          width: 1215,
          height: 717,
          alt: `${champion.name} splash art`,
        },
      ],
    },
  };
}

export default async function ChampionPage({ params }: ChampionPageProps) {
  const { slug } = await params;
  const champion = getChampionBySlug(slug);

  if (!champion) {
    notFound();
  }

  const relatedChampions = getRelatedChampions(champion);

  return (
    <>
      <SiteHeader championCount={championDatabase.championCount} />
      <main className="pb-16">
        <ChampionProfile
          champion={champion}
          relatedChampions={relatedChampions}
          runePaths={championDatabase.runePaths}
          mapSystems={championDatabase.mapSystems}
          dataVersion={championDatabase.version}
        />
      </main>
    </>
  );
}
