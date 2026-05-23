export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['.]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

const avatarPalettes = [
  ["#154e6f", "#c8a85f"],
  ["#31518f", "#2dd4bf"],
  ["#623a8f", "#f4d58a"],
  ["#0f766e", "#3b82f6"],
  ["#8a3f1d", "#c8a85f"],
  ["#53389e", "#22c55e"],
  ["#7f1d1d", "#f97316"],
  ["#1d4ed8", "#a3e635"],
];

export function getAccent(slug: string) {
  const palette = avatarPalettes[hashString(slug) % avatarPalettes.length];

  return {
    from: palette[0],
    to: palette[1],
  };
}

export function getInitials(name: string) {
  const parts = name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
