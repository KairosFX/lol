import type { CSSProperties } from "react";
import type { ChampionMeta } from "@/lib/types";

type ChampionAvatarProps = {
  champion: Pick<ChampionMeta, "name" | "initials" | "accent">;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
};

export function ChampionAvatar({ champion, size = "md" }: ChampionAvatarProps) {
  return (
    <span
      className={`champion-avatar grid shrink-0 place-items-center rounded-lg border border-white/[0.15] font-bold ${sizeClasses[size]}`}
      style={
        {
          "--avatar-a": champion.accent.from,
          "--avatar-b": champion.accent.to,
        } as CSSProperties
      }
      aria-hidden="true"
      title={champion.name}
    >
      {champion.initials}
    </span>
  );
}
