import Link from "next/link";
import { ArrowUpRight, Calendar, Gauge, MapPin } from "lucide-react";
import { ChampionAvatar } from "@/components/ChampionAvatar";
import { ClassBadge, RoleBadge } from "@/components/GameBadges";
import type { ChampionSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChampionCardProps = {
  champion: ChampionSummary;
  compact?: boolean;
};

function formatReleaseDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function ChampionCard({ champion, compact = false }: ChampionCardProps) {
  const secondaryClass = champion.classes.secondary;

  return (
    <Link
      href={`/champions/${champion.slug}`}
      className={cn(
        "focus-ring group relative block overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] transition duration-200 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.085] hover:shadow-gold",
        compact ? "p-3" : "p-4",
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brightgold/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <ChampionAvatar champion={champion} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white">{champion.name}</h3>
              <p className="mt-1 line-clamp-1 text-sm text-slate-400">{champion.title}</p>
            </div>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-slate-500 transition group-hover:text-brightgold"
              size={17}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {champion.roles.slice(0, compact ? 2 : 3).map((role) => (
              <RoleBadge key={role} role={role} compact />
            ))}
          </div>

          {!compact ? (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <ClassBadge championClass={champion.classes.primary} compact />
                {secondaryClass ? (
                  <ClassBadge championClass={secondaryClass} compact secondary />
                ) : null}
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <MapPin aria-hidden="true" size={14} className="text-arcane" />
                  {champion.region}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar aria-hidden="true" size={14} className="text-brightgold" />
                  {formatReleaseDate(champion.releaseDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Gauge aria-hidden="true" size={14} className="text-rift" />
                  {champion.difficulty.label} difficulty
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
