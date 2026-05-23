import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  Database,
  Gauge,
  Info,
  Layers,
  Map,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Swords,
  Timer,
} from "lucide-react";
import { ChampionActions } from "@/components/ChampionActions";
import { ChampionAvatar } from "@/components/ChampionAvatar";
import { ChampionCard } from "@/components/ChampionCard";
import { ClassBadge, RoleBadge, statIcons } from "@/components/GameBadges";
import type {
  ChampionRecord,
  ChampionSummary,
  MapSystemData,
  RunePath,
} from "@/lib/types";

type ChampionProfileProps = {
  champion: ChampionRecord;
  relatedChampions: ChampionSummary[];
  runePaths: RunePath[];
  mapSystems: MapSystemData;
  dataVersion: string;
};

const sidebarLinks = [
  { id: "overview", label: "Overview" },
  { id: "abilities", label: "Abilities" },
  { id: "build", label: "Build" },
  { id: "stats", label: "Stats" },
  { id: "matchups", label: "Matchups" },
  { id: "systems", label: "Map Systems" },
  { id: "sources", label: "Sources" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function statValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function Panel({
  id,
  title,
  children,
  icon,
}: {
  id: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-lg border border-white/10 bg-white/[0.055] p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        {icon ? <span className="text-brightgold">{icon}</span> : null}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function OverviewMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
      <div className="flex items-center gap-2 text-brightgold">{icon}</div>
      <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function AssetIcon({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${sizeClass} shrink-0 rounded-lg border border-white/10 bg-white/[0.06] object-cover`}
    />
  );
}

function MatchupList({
  title,
  champions,
}: {
  title: string;
  champions: ChampionRecord["matchups"]["strongAgainst"];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase text-slate-300">{title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {champions.map((champion) => (
          <Link
            key={champion.slug}
            href={`/champions/${champion.slug}`}
            className="focus-ring flex items-center gap-3 rounded-lg border border-white/10 bg-abyss/50 p-3 transition hover:border-gold/40 hover:bg-white/[0.08]"
          >
            <AssetIcon src={champion.icon} alt="" size="sm" />
            <span className="font-semibold text-white">{champion.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ChampionProfile({
  champion,
  relatedChampions,
  runePaths,
  mapSystems,
  dataVersion,
}: ChampionProfileProps) {
  const secondaryClass = champion.classes.secondary;
  const skillOrder = champion.recommendations.skillOrder.join(" > ");
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
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,8,18,0.98)_0%,rgba(5,8,18,0.82)_44%,rgba(5,8,18,0.5)_78%,rgba(5,8,18,0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-abyss to-transparent" />

        <div className="rift-shell py-8 md:py-12">
          <Link
            href="/champions"
            className="focus-ring mb-8 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Back to champion library
          </Link>

          <div className="flex min-h-[420px] flex-col justify-end gap-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <ChampionAvatar champion={champion} size="xl" priority />
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {champion.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
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

            <div className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-abyss/55 p-4 backdrop-blur-md md:flex-row md:items-center">
              <div className="flex flex-wrap gap-2">
                <ClassBadge championClass={champion.classes.primary} />
                {secondaryClass ? <ClassBadge championClass={secondaryClass} secondary /> : null}
              </div>
              <ChampionActions title={`${champion.name} Champion Database`} />
            </div>
          </div>
        </div>
      </section>

      <section className="rift-shell grid gap-6 py-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
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
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.055] p-2 lg:hidden">
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

          <Panel id="overview" title="Champion Overview" icon={<ShieldCheck size={22} />}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <OverviewMetric
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
              <OverviewMetric
                label="Class"
                icon={<BarChart3 aria-hidden="true" size={20} />}
                value={
                  <span className="flex flex-wrap gap-1.5">
                    <ClassBadge championClass={champion.classes.primary} compact />
                    {secondaryClass ? (
                      <ClassBadge championClass={secondaryClass} compact secondary />
                    ) : null}
                  </span>
                }
              />
              <OverviewMetric
                label="Region"
                icon={<MapPin aria-hidden="true" size={20} />}
                value={champion.region}
              />
              <OverviewMetric
                label="Difficulty"
                icon={<Gauge aria-hidden="true" size={20} />}
                value={`${champion.difficulty.label} (${champion.difficulty.value}/3)`}
              />
              <OverviewMetric
                label="Release Date"
                icon={<Calendar aria-hidden="true" size={20} />}
                value={formatDate(champion.releaseDate)}
              />
              <OverviewMetric
                label="Resource"
                icon={<Database aria-hidden="true" size={20} />}
                value={champion.resource}
              />
            </div>
          </Panel>

          <Panel id="abilities" title="Abilities" icon={<Sparkles size={22} />}>
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

          <Panel id="build" title="Runes, Spells, and Items" icon={<Package size={22} />}>
            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white">Rune Page Preview</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {champion.recommendations.runePage.primaryPath} primary with{" "}
                      {champion.recommendations.runePage.secondaryPath} secondary
                    </p>
                  </div>
                  {champion.recommendations.runePage.keystone ? (
                    <AssetIcon
                      src={champion.recommendations.runePage.keystone.icon}
                      alt={`${champion.recommendations.runePage.keystone.name} rune icon`}
                    />
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {runePaths.map((path) => {
                    const selected =
                      path.name === champion.recommendations.runePage.primaryPath ||
                      path.name === champion.recommendations.runePage.secondaryPath;

                    return (
                      <div
                        key={path.id}
                        className={`rounded-lg border p-2 text-center ${
                          selected
                            ? "border-brightgold/50 bg-brightgold/10"
                            : "border-white/10 bg-white/[0.04]"
                        }`}
                      >
                        <AssetIcon src={path.icon} alt={`${path.name} rune path icon`} size="sm" />
                        <p className="mt-2 truncate text-[11px] font-semibold text-slate-300">
                          {path.name}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-lg border border-gold/25 bg-gold/10 p-3">
                  <p className="text-xs font-semibold uppercase text-brightgold">Keystone</p>
                  <p className="mt-1 font-bold text-white">
                    {champion.recommendations.runePage.keystone?.name ?? "Champion default"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                  <h3 className="font-bold text-white">Summoner Spells</h3>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {champion.recommendations.summonerSpells.map((spell) => (
                      <div key={spell.id} className="flex items-center gap-3">
                        <AssetIcon src={spell.icon} alt={`${spell.name} summoner spell icon`} />
                        <div>
                          <p className="font-semibold text-white">{spell.name}</p>
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {spell.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                  <h3 className="font-bold text-white">Skill Order</h3>
                  <p className="mt-2 text-2xl font-black text-brightgold">{skillOrder}</p>
                  <p className="mt-1 text-sm text-slate-400">Recommended max order by class and role profile.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                <h3 className="font-bold text-white">Core Items</h3>
                <div className="mt-3 grid gap-3">
                  {champion.recommendations.coreItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <AssetIcon src={item.icon} alt={`${item.name} item icon`} />
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.tags.slice(0, 4).join(" / ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                <h3 className="font-bold text-white">Situational Items</h3>
                <div className="mt-3 grid gap-3">
                  {champion.recommendations.situationalItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <AssetIcon src={item.icon} alt={`${item.name} item icon`} />
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.tags.slice(0, 4).join(" / ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel id="stats" title="Stats and Live Meta" icon={<BarChart3 size={22} />}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statRows.map(({ key, label, value, Icon }) => (
                <div key={key} className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                  <Icon aria-hidden="true" className="text-brightgold" size={20} />
                  <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-black text-white">{statValue(value)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {["Win rate", "Pick rate", "Ban rate"].map((label) => (
                <div key={label} className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">Not connected</p>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-400">
              <Info aria-hidden="true" className="mt-0.5 shrink-0 text-arcane" size={16} />
              Live win, pick, and ban rates are intentionally empty until a verified U.GG or OP.GG
              feed is connected. Static champion data is sourced from Riot and League Wiki.
            </p>
          </Panel>

          <Panel id="matchups" title="Counter Matchup Profiles" icon={<Swords size={22} />}>
            <div className="grid gap-5 lg:grid-cols-2">
              <MatchupList title="Strong Into" champions={champion.matchups.strongAgainst} />
              <MatchupList title="Weak Into" champions={champion.matchups.weakAgainst} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              These are role and class profile recommendations generated from verified champion
              classifications, not fabricated live matchup statistics.
            </p>
          </Panel>

          <Panel id="systems" title="Map and Game Systems" icon={<Map size={22} />}>
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                <h3 className="font-bold text-white">Lane Assignments</h3>
                <div className="mt-3 space-y-3">
                  {mapSystems.lanes.map((lane) => (
                    <div key={lane.role} className="flex gap-3">
                      <RoleBadge role={lane.role} compact />
                      <p className="text-sm leading-6 text-slate-400">{lane.assignment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                <h3 className="font-bold text-white">Objective Timers</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[440px] text-left text-sm">
                    <thead className="text-xs uppercase text-slate-500">
                      <tr>
                        <th className="py-2">Objective</th>
                        <th className="py-2">First Spawn</th>
                        <th className="py-2">Respawn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-300">
                      {mapSystems.objectiveTimers.map((timer) => (
                        <tr key={timer.objective}>
                          <td className="py-2 font-semibold text-white">{timer.objective}</td>
                          <td className="py-2">{timer.firstSpawn}</td>
                          <td className="py-2">{timer.respawn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                <h3 className="font-bold text-white">CS Targets</h3>
                <div className="mt-3 space-y-3">
                  {mapSystems.csGuide.map((entry) => (
                    <div key={entry.role} className="flex gap-3">
                      <RoleBadge role={entry.role} compact />
                      <p className="text-sm leading-6 text-slate-400">{entry.target}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-abyss/50 p-4">
                <h3 className="font-bold text-white">Jungle Path Suggestions</h3>
                <ul className="mt-3 space-y-3">
                  {mapSystems.junglePaths.map((path) => (
                    <li key={path} className="flex gap-3 text-sm leading-6 text-slate-400">
                      <Timer aria-hidden="true" className="mt-0.5 shrink-0 text-brightgold" size={16} />
                      {path}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <Panel id="sources" title="Sources" icon={<Clock size={22} />}>
            <div className="grid gap-3 md:grid-cols-2">
              <a
                href={champion.sources.riotDataDragon}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-lg border border-white/10 bg-abyss/50 p-4 transition hover:border-gold/40 hover:bg-white/[0.08]"
              >
                <p className="font-bold text-white">Riot Data Dragon</p>
                <p className="mt-1 text-sm text-slate-400">Champion stats, abilities, images, version {dataVersion}</p>
              </a>
              {champion.sources.riotUniverse ? (
                <a
                  href={champion.sources.riotUniverse}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring rounded-lg border border-white/10 bg-abyss/50 p-4 transition hover:border-gold/40 hover:bg-white/[0.08]"
                >
                  <p className="font-bold text-white">Riot Universe</p>
                  <p className="mt-1 text-sm text-slate-400">Region and champion media source.</p>
                </a>
              ) : null}
              <a
                href={champion.sources.leagueWiki}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-lg border border-white/10 bg-abyss/50 p-4 transition hover:border-gold/40 hover:bg-white/[0.08]"
              >
                <p className="font-bold text-white">League Wiki</p>
                <p className="mt-1 text-sm text-slate-400">Release dates, roles, classes, resource data, and patch metadata.</p>
              </a>
            </div>
          </Panel>

          {relatedChampions.length > 0 ? (
            <section className="rounded-lg border border-white/10 bg-white/[0.055] p-5 md:p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">Related Champions</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Similar role, class, or region profiles.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedChampions.map((relatedChampion) => (
                  <ChampionCard key={relatedChampion.slug} champion={relatedChampion} compact />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </>
  );
}
