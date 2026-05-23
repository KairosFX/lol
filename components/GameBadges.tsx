import type { ComponentType, SVGProps } from "react";
import {
  Activity,
  Crosshair,
  Gem,
  HeartPulse,
  MapPin,
  Shield,
  Sparkles,
  Swords,
  Target,
  TreePine,
  Zap,
} from "lucide-react";
import type { ChampionClassName, RoleName } from "@/lib/types";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const roleMeta: Record<RoleName, { Icon: IconComponent; label: string; tone: string }> = {
  Top: {
    Icon: Shield,
    label: "Top Lane",
    tone: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  },
  Jungle: {
    Icon: TreePine,
    label: "Jungle",
    tone: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
  },
  Mid: {
    Icon: Sparkles,
    label: "Mid Lane",
    tone: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
  },
  ADC: {
    Icon: Crosshair,
    label: "ADC",
    tone: "border-sky-300/35 bg-sky-300/10 text-sky-100",
  },
  Support: {
    Icon: HeartPulse,
    label: "Support",
    tone: "border-violet-300/35 bg-violet-300/10 text-violet-100",
  },
};

const classMeta: Record<ChampionClassName, { Icon: IconComponent; tone: string }> = {
  Assassin: {
    Icon: Zap,
    tone: "border-red-300/35 bg-red-300/10 text-red-100",
  },
  Mage: {
    Icon: Sparkles,
    tone: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
  },
  Fighter: {
    Icon: Swords,
    tone: "border-orange-300/35 bg-orange-300/10 text-orange-100",
  },
  Tank: {
    Icon: Shield,
    tone: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
  },
  Marksman: {
    Icon: Target,
    tone: "border-sky-300/35 bg-sky-300/10 text-sky-100",
  },
  Support: {
    Icon: HeartPulse,
    tone: "border-violet-300/35 bg-violet-300/10 text-violet-100",
  },
};

export const statIcons = {
  hp: HeartPulse,
  attackDamage: Swords,
  abilityPower: Sparkles,
  armor: Shield,
  magicResist: Gem,
  moveSpeed: Zap,
  attackRange: Target,
  attackSpeed: Activity,
  region: MapPin,
} satisfies Record<string, IconComponent>;

export function getRoleMeta(role: RoleName) {
  return roleMeta[role];
}

export function getClassMeta(championClass: ChampionClassName) {
  return classMeta[championClass];
}

export function RoleBadge({
  role,
  compact = false,
  selected = false,
}: {
  role: RoleName;
  compact?: boolean;
  selected?: boolean;
}) {
  const { Icon, label, tone } = roleMeta[role];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold",
        compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
        selected ? "border-brightgold/60 bg-brightgold/15 text-brightgold" : tone,
      )}
      title={label}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {role}
    </span>
  );
}

export function ClassBadge({
  championClass,
  compact = false,
  secondary = false,
}: {
  championClass: ChampionClassName;
  compact?: boolean;
  secondary?: boolean;
}) {
  const { Icon, tone } = classMeta[championClass];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold",
        compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
        secondary ? "border-white/10 bg-white/[0.06] text-slate-300" : tone,
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {championClass}
    </span>
  );
}
