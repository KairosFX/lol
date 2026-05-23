import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Layers, ScrollText } from "lucide-react";
import { ChampionAvatar } from "@/components/ChampionAvatar";
import { ChampionCard } from "@/components/ChampionCard";
import { GuideActions } from "@/components/GuideActions";
import { GuideContent } from "@/components/GuideContent";
import { SiteHeader } from "@/components/SiteHeader";
import { TableOfContents } from "@/components/TableOfContents";
import {
  getAllChampions,
  getAllChampionGuides,
  getChampionBySlug,
  getRelatedChampions,
} from "@/lib/champions";
import { parseGuideContent } from "@/lib/guide-format";

type ChampionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const champions = await getAllChampionGuides();
  return champions.map((champion) => ({
    slug: champion.slug,
  }));
}

export async function generateMetadata({ params }: ChampionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const champion = await getChampionBySlug(slug);

  if (!champion) {
    return {
      title: "Champion Guide",
    };
  }

  return {
    title: `${champion.name} Guide`,
    description: champion.excerpt,
    alternates: {
      canonical: `/champions/${champion.slug}`,
    },
    openGraph: {
      title: `${champion.name} Guide`,
      description: champion.excerpt,
      type: "article",
      url: `/champions/${champion.slug}`,
    },
  };
}

export default async function ChampionPage({ params }: ChampionPageProps) {
  const { slug } = await params;
  const [champions, champion] = await Promise.all([getAllChampions(), getChampionBySlug(slug)]);

  if (!champion) {
    notFound();
  }

  const sections = parseGuideContent(champion.content);
  const relatedChampions = getRelatedChampions(champions, champion);

  return (
    <>
      <SiteHeader championCount={champions.length} />
      <main className="pb-16">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(244,213,138,0.12),transparent_34%,rgba(45,212,191,0.08))]" />
          <div className="rift-shell py-8 md:py-12">
            <Link
              href="/champions"
              className="focus-ring mb-8 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Back to champion index
            </Link>

            <div className="glass-panel gold-stroke rounded-lg p-5 md:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <ChampionAvatar champion={champion} size="lg" />
                  <div>
                    <h1 className="text-4xl font-black text-white md:text-6xl">
                      {champion.name}
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                      {champion.excerpt}
                    </p>
                  </div>
                </div>
                <GuideActions title={`${champion.name} Guide`} path={`/champions/${champion.slug}`} />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <Layers aria-hidden="true" className="text-brightgold" size={22} />
                  <p className="mt-3 text-xs uppercase text-slate-500">Identity</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {champion.identity || "Champion"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <BookOpen aria-hidden="true" className="text-arcane" size={22} />
                  <p className="mt-3 text-xs uppercase text-slate-500">Role</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {champion.role || "Guide"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <ScrollText aria-hidden="true" className="text-rift" size={22} />
                  <p className="mt-3 text-xs uppercase text-slate-500">Archive</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {sections.length} sections / {champion.wordCount} words
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rift-shell grid gap-6 py-8 lg:grid-cols-[250px_1fr]">
          <TableOfContents sections={sections} />
          <div className="min-w-0">
            <div className="mb-5 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.06] p-2 lg:hidden">
              <div className="flex min-w-max gap-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="focus-ring rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
            <GuideContent sections={sections} />

            {relatedChampions.length > 0 ? (
              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Related Guides</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Similar archive structure and role signals.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedChampions.map((relatedChampion) => (
                    <ChampionCard
                      key={relatedChampion.slug}
                      champion={relatedChampion}
                      compact
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
