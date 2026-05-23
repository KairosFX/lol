import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { ChampionAvatar } from "@/components/ChampionAvatar";
import type { ChampionMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChampionCardProps = {
  champion: ChampionMeta;
  compact?: boolean;
  priority?: boolean;
};

export function ChampionCard({ champion, compact = false }: ChampionCardProps) {
  return (
    <Link
      href={`/champions/${champion.slug}`}
      className={cn(
        "focus-ring group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-4 transition duration-200 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.09] hover:shadow-gold",
        compact && "p-3",
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brightgold/60 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <ChampionAvatar champion={champion} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-base font-semibold text-white">{champion.name}</h3>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-slate-500 transition group-hover:text-brightgold"
              size={17}
            />
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-slate-400">
            {champion.identity || champion.role || "Champion guide"}
          </p>
          {!compact ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <BookOpen aria-hidden="true" size={14} />
              <span>{champion.sectionTitles.length} sections</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span>{champion.wordCount} words</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
