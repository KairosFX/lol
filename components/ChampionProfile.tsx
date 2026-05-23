import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Clock,
  Crosshair,
  Gauge,
  Layers,
  Package,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { ChampionActions } from "@/components/ChampionActions";
import { ChampionAvatar } from "@/components/ChampionAvatar";
import { ChampionCard } from "@/components/ChampionCard";
import { ClassBadge, RoleBadge, statIcons } from "@/components/GameBadges";
import type {
  ChampionRecord,
  ChampionSummary,
  CoachingSection,
  ItemBuildEntry,
  MatchupStat,
  RunePage,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type ChampionProfileProps = {
  champion: ChampionRecord;
  relatedChampions: ChampionSummary[];
  dataVersion: string;
  dataGeneratedAt: string;
};

const sidebarLinks = [
  { id: "overview", label: "Overview" },
  { id: "power-spikes", label: "Power Spikes" },
  { id: "abilities", label: "Abilities" },
  { id: "runes", label: "Runes" },
  { id: "items", label: "Items" },
  { id: "analytics", label: "Analytics" },
  { id: "matchups", label: "Matchups" },
  { id: "coaching", label: "Pro Tips" },
  { id: "high-elo", label: "High Elo" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatSyncDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function statValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function percent(value: number | null | undefined) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "N/A";
}

function compactNumber(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-US").format(value) : "N/A";
}

function signed(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  return `${value}`;
}

function Panel({
  id,
  title,
  children,
  icon,
  lead,
}: {
  id: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  lead?: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-lg border border-white/10 bg-white/[0.055] p-5 md:p-6"
    >
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="flex items-center gap-3">
          {icon ? <span className="text-brightgold">{icon}</span> : null}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {lead ? <p className="max-w-2xl text-sm leading-6 text-slate-400">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

function AssetIcon({
  src,
  alt,
  size = "md",
  rounded = true,
}: {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
  rounded?: boolean;
}) {
  const sizeClass =
    size === "xs" ? "h-8 w-8" : size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <img
      src={src}
      alt={alt}
      title={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        sizeClass,
        "shrink-0 border border-white/10 bg-white/[0.06] object-cover",
        rounded ? "rounded-lg" : "rounded-full",
      )}
    />
  );
}

function MetricCard({
  label,
  value,
  icon,
  detail,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
      <div className="flex items-center gap-2 text-brightgold">{icon}</div>
      <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-sm font-black text-brightgold">{value}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-arcane via-brightgold to-ember"
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
      {description ? <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p> : null}
    </div>
  );
}

function RuneIconRow({ runes }: { runes: RunePage["primaryRunes"] }) {
  return (
    <div className="grid gap-2">
      {runes.map((rune) => (
        <div key={`${rune.path}-${rune.id}`} className="flex min-w-0 items-center gap-3">
          <AssetIcon src={rune.icon} alt={rune.name} size="sm" rounded={false} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{rune.name}</p>
            <p className="line-clamp-1 text-xs text-slate-500">{rune.shortDesc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RunePageCard({ page }: { page: RunePage }) {
  return (
    <article className="rounded-lg border border-white/10 bg-abyss/50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-brightgold">{page.label}</p>
          <h3 className="mt-1 text-xl font-black text-white">
            {page.primaryRunes[0]?.name ?? page.primaryPath.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{page.note}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-2">
            <span className="block font-black text-white">{percent(page.winRate)}</span>
            <span className="text-slate-500">Win</span>
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-2">
            <span className="block font-black text-white">{percent(page.pickRate)}</span>
            <span className="text-slate-500">Pick</span>
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-2">
            <span className="block font-black text-white">{compactNumber(page.matchCount)}</span>
            <span className="text-slate-500">Matches</span>
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_0.7fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AssetIcon src={page.primaryPath.icon} alt={`${page.primaryPath.name} tree`} size="xs" rounded={false} />
            <h4 className="text-sm font-bold text-white">{page.primaryPath.name} Primary</h4>
          </div>
          <RuneIconRow runes={page.primaryRunes} />
        </div>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AssetIcon src={page.secondaryPath.icon} alt={`${page.secondaryPath.name} tree`} size="xs" rounded={false} />
            <h4 className="text-sm font-bold text-white">{page.secondaryPath.name} Secondary</h4>
          </div>
          <RuneIconRow runes={page.secondaryRunes} />
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-white">Rune Shards</h4>
          <div className="grid gap-2">
            {page.shards.map((shard) => (
              <div key={`${shard.category}-${shard.id}`} className="flex items-center gap-3">
                <AssetIcon src={shard.icon} alt={shard.name} size="xs" rounded={false} />
                <div>
                  <p className="text-sm font-semibold text-white">{shard.name}</p>
                  <p className="text-xs capitalize text-slate-500">{shard.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ItemRow({ item }: { item: ItemBuildEntry }) {
  return (
    <details className="group rounded-lg border border-white/10 bg-abyss/50 p-3 open:border-gold/35">
      <summary className="flex cursor-pointer list-none items-center gap-3">
        <AssetIcon src={item.icon} alt={item.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white">{item.name}</p>
          <p className="text-xs text-slate-500">{item.timing}</p>
        </div>
        <div className="hidden grid-cols-2 gap-2 text-right text-xs sm:grid">
          <span>
            <span className="block font-black text-white">{percent(item.winRate)}</span>
            <span className="text-slate-500">WR</span>
          </span>
          <span>
            <span className="block font-black text-white">{percent(item.pickRate)}</span>
            <span className="text-slate-500">PR</span>
          </span>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="text-slate-500 transition group-open:rotate-90 group-hover:text-brightgold"
          size={18}
        />
      </summary>
      <div className="mt-3 border-t border-white/10 pt-3 text-sm leading-6 text-slate-400">
        <p>{item.explanation}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">
            Order frequency {percent(item.purchaseOrderFrequency)}
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">
            {compactNumber(item.matchCount)} matches
          </span>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </details>
  );
}

function ItemGroup({
  title,
  items,
}: {
  title: string;
  items: ItemBuildEntry[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase text-slate-300">{title}</h3>
      <div className="grid gap-2">
        {items.map((item) => (
          <ItemRow key={`${title}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function BuildTimeline({ champion }: { champion: ChampionRecord }) {
  return (
    <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
      <h3 className="font-bold text-white">Build Progression Timeline</h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {champion.recommendations.itemBuild.timeline.map((step, index) => (
          <div key={step.label} className="relative rounded-lg border border-white/10 bg-white/[0.045] p-3">
            {index < champion.recommendations.itemBuild.timeline.length - 1 ? (
              <span className="pointer-events-none absolute -right-3 top-9 hidden h-px w-3 bg-gold/35 lg:block" />
            ) : null}
            <p className="text-xs font-semibold uppercase text-brightgold">{step.minute}</p>
            <p className="mt-1 font-bold text-white">{step.label}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {step.items.map((item) => (
                <AssetIcon key={`${step.label}-${item.id}`} src={item.icon} alt={item.name} size="xs" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PowerSpikeSection({ champion }: { champion: ChampionRecord }) {
  const phaseNotes: Record<string, string> = {
    "0-15 min": "Lane setup, first recall, first objective entry, and cooldown abuse.",
    "15-25 min": "One-to-three item conversion, side-lane pressure, and grouped skirmishes.",
    "25-35 min": "Vision denial, Baron control, flank timing, and decisive teamfight setup.",
    "35+ min": "Full-build positioning, summoner discipline, and Elder or base access.",
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {champion.competitive.gameLength.map((entry) => (
          <article key={entry.bucket} className="rounded-lg border border-white/10 bg-abyss/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">{entry.bucket}</p>
                <h3 className="mt-1 text-lg font-black text-white">{percent(entry.winRate)}</h3>
              </div>
              <span className="rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-xs font-black text-brightgold">
                {entry.rating}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-arcane via-brightgold to-ember"
                style={{ width: `${Math.max(4, Math.min(100, entry.rating))}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {phaseNotes[entry.bucket] ?? entry.note}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h3 className="font-bold text-white">Power Spike Timeline</h3>
            <p className="mt-1 text-sm text-slate-500">
              Item checkpoints tied to the phase ratings above.
            </p>
          </div>
          <p className="text-sm font-black text-brightgold">
            {champion.recommendations.skillOrder.join(" > ")} max
          </p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          {champion.recommendations.itemBuild.timeline.map((step, index) => (
            <div key={`spike-${step.label}`} className="relative rounded-lg border border-white/10 bg-white/[0.045] p-3">
              {index < champion.recommendations.itemBuild.timeline.length - 1 ? (
                <span className="pointer-events-none absolute -right-3 top-9 hidden h-px w-3 bg-gold/35 lg:block" />
              ) : null}
              <p className="text-xs font-semibold uppercase text-brightgold">{step.minute}</p>
              <p className="mt-1 font-bold text-white">{step.label}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {step.items.map((item) => (
                  <AssetIcon key={`spike-${step.label}-${item.id}`} src={item.icon} alt={item.name} size="xs" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchupCard({ matchup, tone }: { matchup: MatchupStat; tone: "good" | "bad" }) {
  return (
    <Link
      href={`/champions/${matchup.slug}`}
      className="focus-ring block rounded-lg border border-white/10 bg-abyss/50 p-4 transition hover:border-gold/40 hover:bg-white/[0.08]"
    >
      <div className="flex items-center gap-3">
        <AssetIcon src={matchup.icon} alt={matchup.name} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-white">{matchup.name}</h3>
          <p
            className={cn(
              "text-xs font-semibold",
              tone === "good" ? "text-emerald-300" : "text-red-300",
            )}
          >
            {matchup.difficulty} matchup
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-white">{percent(matchup.winRate)}</p>
          <p className="text-xs text-slate-500">Win rate</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-2">
          <span className="block font-black text-white">{percent(matchup.laneKillRate)}</span>
          <span className="text-slate-500">Lane kill</span>
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-2">
          <span className="block font-black text-white">{signed(matchup.goldDiffAt15)}</span>
          <span className="text-slate-500">Gold @15</span>
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-2">
          <span className="block font-black text-white">{signed(matchup.xpDiffAt15)}</span>
          <span className="text-slate-500">XP @15</span>
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-2">
          <span className="block font-black text-white">{signed(matchup.csDiffAt15)}</span>
          <span className="text-slate-500">CS @15</span>
        </span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{matchup.note}</p>
    </Link>
  );
}

function CoachingDetails({ title, sections }: { title: string; sections: CoachingSection[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase text-slate-300">{title}</h3>
      <div className="grid gap-3">
        {sections.map((section, index) => (
          <details
            key={section.title}
            className="group rounded-lg border border-white/10 bg-abyss/50 p-4 open:border-gold/35"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="font-bold text-white">{section.title}</span>
              <ChevronRight
                aria-hidden="true"
                className="shrink-0 text-slate-500 transition group-open:rotate-90 group-hover:text-brightgold"
                size={18}
              />
            </summary>
            <ul className="mt-4 grid gap-3">
              {section.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-6 text-slate-400">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brightgold" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function QuickBuildSidebar({
  champion,
  dataGeneratedAt,
}: {
  champion: ChampionRecord;
  dataGeneratedAt: string;
}) {
  const bestRune = champion.recommendations.runePages[0];
  const compactCore = champion.recommendations.itemBuild.coreBuild.slice(0, 3);

  return (
    <div className="sticky top-24 space-y-4">
      <div className="rounded-lg border border-gold/30 bg-gold/10 p-4">
        <p className="text-xs font-semibold uppercase text-brightgold">
          Patch {champion.competitive.patch} · {champion.competitive.rank}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <span>
            <span className="block text-lg font-black text-white">{percent(champion.competitive.winRate)}</span>
            <span className="text-slate-400">Win</span>
          </span>
          <span>
            <span className="block text-lg font-black text-white">{percent(champion.competitive.pickRate)}</span>
            <span className="text-slate-400">Pick</span>
          </span>
          <span>
            <span className="block text-lg font-black text-white">{percent(champion.competitive.banRate)}</span>
            <span className="text-slate-400">Ban</span>
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Synced {formatSyncDate(dataGeneratedAt)} UTC
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
        <h3 className="font-bold text-white">Best Rune Page</h3>
        <div className="mt-3 flex items-center gap-3">
          <AssetIcon src={bestRune.primaryRunes[0]?.icon ?? bestRune.primaryPath.icon} alt={bestRune.primaryRunes[0]?.name ?? bestRune.primaryPath.name} />
          <div>
            <p className="font-semibold text-white">{bestRune.primaryRunes[0]?.name ?? bestRune.primaryPath.name}</p>
            <p className="text-xs text-slate-500">
              {bestRune.primaryPath.name} + {bestRune.secondaryPath.name}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...bestRune.primaryRunes, ...bestRune.secondaryRunes].map((rune) => (
            <AssetIcon key={`quick-${rune.id}`} src={rune.icon} alt={rune.name} size="xs" rounded={false} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
        <h3 className="font-bold text-white">Core Build</h3>
        <div className="mt-3 grid gap-3">
          {compactCore.map((item) => (
            <div key={`sidebar-${item.id}`} className="flex items-center gap-3">
              <AssetIcon src={item.icon} alt={item.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-500">{percent(item.winRate)} WR</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
        <h3 className="font-bold text-white">Spells</h3>
        <div className="mt-3 flex gap-2">
          {champion.recommendations.summonerSpells.map((spell) => (
            <AssetIcon key={spell.id} src={spell.icon} alt={spell.name} />
          ))}
        </div>
        <p className="mt-3 text-sm font-black text-brightgold">
          {champion.recommendations.skillOrder.join(" > ")}
        </p>
      </div>
    </div>
  );
}

export function ChampionProfile({
  champion,
  relatedChampions,
  dataVersion,
  dataGeneratedAt,
}: ChampionProfileProps) {
  const secondaryClass = champion.classes.secondary;
  const statRows = [
    { key: "hp", label: "HP", value: champion.stats.hp, Icon: statIcons.hp },
    {
      key: "attackDamage",
      label: "Attack Damage",
      value: champion.stats.attackDamage,
      Icon: statIcons.attackDamage,
    },
    {
      key: "abilityPower",
      label: "Ability Power",
      value: champion.stats.abilityPower,
      Icon: statIcons.abilityPower,
    },
    { key: "armor", label: "Armor", value: champion.stats.armor, Icon: statIcons.armor },
    {
      key: "magicResist",
      label: "Magic Resist",
      value: champion.stats.magicResist,
      Icon: statIcons.magicResist,
    },
    {
      key: "moveSpeed",
      label: "Move Speed",
      value: champion.stats.moveSpeed,
      Icon: statIcons.moveSpeed,
    },
    {
      key: "attackRange",
      label: "Attack Range",
      value: champion.stats.attackRange,
      Icon: statIcons.attackRange,
    },
    {
      key: "attackSpeed",
      label: "Attack Speed",
      value: champion.stats.attackSpeed,
      Icon: statIcons.attackSpeed,
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <img
          src={champion.images.splash}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,8,18,0.98)_0%,rgba(5,8,18,0.86)_42%,rgba(5,8,18,0.5)_72%,rgba(5,8,18,0.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-abyss to-transparent" />

        <div className="rift-shell py-8 md:py-12">
          <Link
            href="/champions"
            className="focus-ring mb-8 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Back to champion library
          </Link>

          <div className="flex min-h-[430px] flex-col justify-end gap-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <ChampionAvatar champion={champion} size="xl" priority />
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {champion.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                  <span className="inline-flex items-center rounded-md border border-brightgold/40 bg-brightgold/10 px-2.5 py-1.5 text-xs font-semibold text-brightgold">
                    Tier {champion.competitive.tier}
                  </span>
                </div>
                <h1 className="mt-4 text-5xl font-black leading-none text-white md:text-7xl">
                  {champion.name}
                </h1>
                <p className="mt-3 text-xl font-semibold text-brightgold">{champion.title}</p>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 md:text-lg">
                  {champion.blurb}
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border border-white/10 bg-abyss/60 p-4 backdrop-blur-md md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex flex-wrap gap-2">
                <ClassBadge championClass={champion.classes.primary} />
                {secondaryClass ? <ClassBadge championClass={secondaryClass} secondary /> : null}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-slate-300">
                  <Clock aria-hidden="true" size={14} />
                  Data Dragon {dataVersion}
                </span>
              </div>
              <ChampionActions title={`${champion.name} Competitive Intelligence`} />
            </div>
          </div>
        </div>
      </section>

      <section className="rift-shell grid gap-6 py-8 xl:grid-cols-[210px_minmax(0,1fr)_280px]">
        <aside className="hidden xl:block">
          <nav className="sticky top-24 rounded-lg border border-white/10 bg-white/[0.055] p-3">
            {sidebarLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="focus-ring block rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.055] p-2 xl:hidden">
            <div className="flex min-w-max gap-2">
              {sidebarLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="focus-ring rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="xl:hidden">
            <QuickBuildSidebar champion={champion} dataGeneratedAt={dataGeneratedAt} />
          </div>

          <Panel id="overview" title="Competitive Overview" icon={<ShieldCheck size={22} />}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Win Rate" value={percent(champion.competitive.winRate)} icon={<Trophy size={20} />} detail={`${compactNumber(champion.competitive.matchCount)} matches`} />
              <MetricCard label="Pick Rate" value={percent(champion.competitive.pickRate)} icon={<Crosshair size={20} />} detail={`${percent(champion.competitive.rolePopularity)} role popularity`} />
              <MetricCard label="Ban Rate" value={percent(champion.competitive.banRate)} icon={<Shield size={20} />} detail={`${champion.competitive.region} ${champion.competitive.rank}`} />
              <MetricCard label="Tier Ranking" value={`${champion.competitive.tier} #${champion.competitive.tierRank}`} icon={<BarChart3 size={20} />} detail={`Primary role: ${champion.primaryRole}`} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="Role"
                icon={<Layers aria-hidden="true" size={20} />}
                value={
                  <span className="flex flex-wrap gap-1.5">
                    {champion.roles.map((role) => (
                      <RoleBadge key={role} role={role} compact />
                    ))}
                  </span>
                }
              />
              <MetricCard
                label="Class"
                icon={<Activity aria-hidden="true" size={20} />}
                value={
                  <span className="flex flex-wrap gap-1.5">
                    <ClassBadge championClass={champion.classes.primary} compact />
                    {secondaryClass ? (
                      <ClassBadge championClass={secondaryClass} compact secondary />
                    ) : null}
                  </span>
                }
              />
              <MetricCard label="Difficulty" icon={<Gauge aria-hidden="true" size={20} />} value={`${champion.difficulty.label} (${champion.difficulty.value}/3)`} />
              <MetricCard label="Region" icon={<Route aria-hidden="true" size={20} />} value={champion.region} />
              <MetricCard label="Release Date" icon={<Calendar aria-hidden="true" size={20} />} value={formatDate(champion.releaseDate)} />
              <MetricCard label="Resource" icon={<Zap aria-hidden="true" size={20} />} value={champion.resource} />
            </div>
          </Panel>

          <Panel
            id="power-spikes"
            title="Power Spikes"
            icon={<TrendingUp size={22} />}
            lead="Early, mid, late, and full-build phase ratings connected to item timing and skill order."
          >
            <PowerSpikeSection champion={champion} />
          </Panel>

          <Panel id="abilities" title="Abilities and Spell Data" icon={<Sparkles size={22} />}>
            <div className="grid gap-3">
              {champion.abilities.map((ability) => (
                <article
                  key={ability.slot}
                  className="rounded-lg border border-white/10 bg-abyss/50 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative">
                      <AssetIcon src={ability.icon} alt={`${ability.name} icon`} size="lg" />
                      <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-md border border-gold/40 bg-abyss text-xs font-black text-brightgold">
                        {ability.slot}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-white">{ability.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {ability.description}
                      </p>
                      {ability.slot !== "P" ? (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">
                            Cooldown {ability.cooldown}
                          </span>
                          <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">
                            Cost {ability.cost}
                          </span>
                          <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">
                            Range {ability.range}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel
            id="runes"
            title="Full Rune Pages"
            icon={<Target size={22} />}
            lead="Primary tree, secondary tree, every selected rune, shard choices, win rate, pick rate, and match counts."
          >
            <div className="grid gap-4">
              {champion.recommendations.runePages.map((page) => (
                <RunePageCard key={page.id} page={page} />
              ))}
            </div>
          </Panel>

          <Panel id="items" title="Item Builds and Timing" icon={<Package size={22} />}>
            <div className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                  <h3 className="font-bold text-white">Spells and Skill Order</h3>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {champion.recommendations.summonerSpells.map((spell) => (
                      <div key={spell.id} className="flex min-w-0 items-center gap-3">
                        <AssetIcon src={spell.icon} alt={`${spell.name} summoner spell icon`} />
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{spell.name}</p>
                          <p className="line-clamp-1 text-xs text-slate-500">{spell.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase text-slate-500">Skill max</p>
                  <p className="mt-1 text-2xl font-black text-brightgold">
                    {champion.recommendations.skillOrder.join(" > ")}
                  </p>
                </div>
                <BuildTimeline champion={champion} />
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <ItemGroup title="Starting Items" items={champion.recommendations.itemBuild.startingItems} />
                <ItemGroup title="First Recall Items" items={champion.recommendations.itemBuild.firstRecallItems} />
                <ItemGroup title="Boots Options" items={champion.recommendations.itemBuild.bootsOptions} />
                <ItemGroup title="Core Build" items={champion.recommendations.itemBuild.coreBuild} />
                <ItemGroup title="Full Build" items={champion.recommendations.itemBuild.fullBuild} />
                <ItemGroup title="Situational Items" items={champion.recommendations.itemBuild.situationalItems} />
                <ItemGroup title="Anti-Heal Options" items={champion.recommendations.itemBuild.antiHealOptions} />
                <ItemGroup title="Defensive Options" items={champion.recommendations.itemBuild.defensiveOptions} />
                <ItemGroup title="Snowball Builds" items={champion.recommendations.itemBuild.snowballBuilds} />
                <ItemGroup title="Late-Game Sell Options" items={champion.recommendations.itemBuild.lateGameSellOptions} />
              </div>
            </div>
          </Panel>

          <Panel
            id="analytics"
            title="Advanced Analytics"
            icon={<BarChart3 size={22} />}
            lead="Power curve, role pressure, objective value, scaling profile, and game-length performance."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {champion.competitive.metrics.map((metric) => (
                <ScoreBar key={metric.key} label={metric.label} value={metric.value} description={metric.description} />
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-abyss/50 p-4">
              <h3 className="font-bold text-white">Game Length Scaling</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {champion.competitive.gameLength.map((entry) => (
                  <div key={entry.bucket} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-white">{entry.bucket}</p>
                      <p className="text-lg font-black text-brightgold">{percent(entry.winRate)}</p>
                    </div>
                    <ScoreBar label="Phase rating" value={entry.rating} description={entry.note} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statRows.map(({ key, label, value, Icon }) => (
                <MetricCard key={key} label={label} value={statValue(value)} icon={<Icon aria-hidden="true" size={20} />} />
              ))}
            </div>
          </Panel>

          <Panel
            id="matchups"
            title="Matchup Statistics"
            icon={<Swords size={22} />}
            lead="Hardest counters, easiest lanes, lane kill rates, gold, XP, and CS difference at 15 minutes."
          >
            <div className="grid gap-5 xl:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase text-emerald-300">Easiest Matchups</h3>
                <div className="grid gap-3">
                  {champion.matchups.strongAgainst.map((matchup) => (
                    <MatchupCard key={matchup.slug} matchup={matchup} tone="good" />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase text-red-300">Hardest Counters</h3>
                <div className="grid gap-3">
                  {champion.matchups.weakAgainst.map((matchup) => (
                    <MatchupCard key={matchup.slug} matchup={matchup} tone="bad" />
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            id="coaching"
            title="Pro Tips"
            icon={<Brain size={22} />}
            lead="Micro and macro coaching built around the champion's abilities, role, power curve, and build profile."
          >
            <div className="grid gap-5 xl:grid-cols-2">
              <CoachingDetails title="Micro Gameplay" sections={champion.coaching.micro} />
              <CoachingDetails title="Macro Gameplay" sections={champion.coaching.macro} />
            </div>
          </Panel>

          <Panel id="high-elo" title="High Elo and Pro Analysis" icon={<Trophy size={22} />}>
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-3">
                <ScoreBar label="Carry Potential" value={champion.competitive.carryPotentialScore} description="Gold-funnel value, damage ceiling, and shutdown conversion." />
                <ScoreBar label="Roaming Effectiveness" value={champion.competitive.roamingEffectiveness} description="Push timing, mobility, and map pressure." />
                <ScoreBar label="Objective Control" value={champion.competitive.objectiveControlRating} description="Neutral objective setup and fight reliability." />
              </div>
              <div className="grid gap-5">
                <CoachingDetails title="Challenger and Pro Notes" sections={champion.coaching.highElo} />
                <CoachingDetails title="Review System" sections={champion.coaching.pro} />
              </div>
            </div>
          </Panel>

          {relatedChampions.length > 0 ? (
            <section className="rounded-lg border border-white/10 bg-white/[0.055] p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <BookOpen aria-hidden="true" className="text-brightgold" size={22} />
                <div>
                  <h2 className="text-2xl font-bold text-white">Related Champions</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Similar role, class, or region profiles.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedChampions.map((relatedChampion) => (
                  <ChampionCard key={relatedChampion.slug} champion={relatedChampion} compact />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="hidden xl:block">
          <QuickBuildSidebar champion={champion} dataGeneratedAt={dataGeneratedAt} />
        </aside>
      </section>
    </>
  );
}
