import type { ChampionSummary } from "@/lib/types";

type ChampionAvatarProps = {
  champion: Pick<ChampionSummary, "name" | "icon" | "images">;
  size?: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

export function ChampionAvatar({ champion, size = "md", priority = false }: ChampionAvatarProps) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-white/[0.16] bg-white/[0.06] shadow-gold ${sizeClasses[size]}`}
      title={champion.name}
    >
      <img
        src={champion.images.icon || champion.icon}
        alt=""
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
