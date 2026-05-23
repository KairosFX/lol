import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import { extractSectionTitles } from "@/lib/guide-format";
import type { ChampionGuide, ChampionMeta } from "@/lib/types";
import { getAccent, getInitials, slugify } from "@/lib/utils";

const guideDirectory = path.join(process.cwd(), "data", "lol_detailed_guide");
const fallbackDirectory = process.cwd();
const romanNumeralPattern = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i;

async function directoryExists(directory: string) {
  try {
    const stat = await fs.stat(directory);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function getGuideDirectory() {
  return (await directoryExists(guideDirectory)) ? guideDirectory : fallbackDirectory;
}

function isGuideFile(fileName: string) {
  return fileName.toLowerCase().endsWith(".txt") && fileName.toLowerCase() !== "readme.txt";
}

export function championNameFromFile(fileName: string) {
  const baseName = path.basename(fileName, ".txt").replace(/_/g, " ");

  return baseName
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word === "&") {
        return word;
      }

      if (romanNumeralPattern.test(word)) {
        return word.toUpperCase();
      }

      return word.replace(/(^|[.'-])([a-z])/g, (_, prefix: string, letter: string) => {
        return `${prefix}${letter.toUpperCase()}`;
      });
    })
    .join(" ");
}

export function championSlugFromFile(fileName: string) {
  return slugify(path.basename(fileName, ".txt"));
}

function extractValueAfterHeading(raw: string, heading: string) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const target = heading.toLowerCase();

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().toLowerCase() === target) {
      for (let valueIndex = index + 1; valueIndex < lines.length; valueIndex += 1) {
        const value = lines[valueIndex].trim();

        if (value) {
          return value;
        }
      }
    }
  }

  return "";
}

function buildExcerpt(name: string, raw: string) {
  const role = extractValueAfterHeading(raw, "Primary Role");
  const identity = extractValueAfterHeading(raw, "Champion Identity");
  const opener = [identity, role].filter(Boolean).join(" / ");

  if (opener) {
    return `${name} guide for ${opener}, including abilities, rune setup, item builds, matchups, and teamfight plans.`;
  }

  return `${name} guide covering abilities, rune setup, item builds, lane plans, matchups, and macro decisions.`;
}

function countWords(raw: string) {
  return raw.trim().split(/\s+/).filter(Boolean).length;
}

function buildMeta(fileName: string, content: string): ChampionMeta {
  const name = championNameFromFile(fileName);
  const slug = championSlugFromFile(fileName);
  const role = extractValueAfterHeading(content, "Primary Role");
  const identity = extractValueAfterHeading(content, "Champion Identity");
  const sectionTitles = extractSectionTitles(content);
  const excerpt = buildExcerpt(name, content);

  return {
    slug,
    name,
    fileName,
    initials: getInitials(name),
    role,
    identity,
    excerpt,
    sectionTitles,
    wordCount: countWords(content),
    searchText: [name, slug, role, identity, sectionTitles.join(" "), content]
      .join(" ")
      .toLowerCase(),
    accent: getAccent(slug),
  };
}

export const getAllChampionGuides = cache(async (): Promise<ChampionGuide[]> => {
  const directory = await getGuideDirectory();
  const fileNames = (await fs.readdir(directory)).filter(isGuideFile).sort((a, b) => {
    return championNameFromFile(a).localeCompare(championNameFromFile(b));
  });

  const guides = await Promise.all(
    fileNames.map(async (fileName) => {
      const content = await fs.readFile(path.join(directory, fileName), "utf8");
      return {
        ...buildMeta(fileName, content),
        content,
      };
    }),
  );

  return guides;
});

export const getAllChampions = cache(async (): Promise<ChampionMeta[]> => {
  const guides = await getAllChampionGuides();
  return guides.map(({ content: _content, ...meta }) => meta);
});

export async function getChampionBySlug(slug: string) {
  const guides = await getAllChampionGuides();
  return guides.find((guide) => guide.slug === slug) ?? null;
}

export function getFeaturedChampions(champions: ChampionMeta[], count = 6) {
  return [...champions]
    .sort((a, b) => {
      const aScore = a.slug.split("").reduce((score, letter) => score + letter.charCodeAt(0), 0);
      const bScore = b.slug.split("").reduce((score, letter) => score + letter.charCodeAt(0), 0);
      return bScore - aScore;
    })
    .slice(0, count);
}

export function getRelatedChampions(
  champions: ChampionMeta[],
  champion: ChampionMeta,
  count = 4,
) {
  return champions
    .filter((candidate) => candidate.slug !== champion.slug)
    .map((candidate) => {
      const roleScore = candidate.role && candidate.role === champion.role ? 3 : 0;
      const identityScore = candidate.identity && candidate.identity === champion.identity ? 2 : 0;
      const sectionOverlap = candidate.sectionTitles.filter((section) =>
        champion.sectionTitles.includes(section),
      ).length;

      return {
        champion: candidate,
        score: roleScore + identityScore + sectionOverlap,
      };
    })
    .sort((a, b) => b.score - a.score || a.champion.name.localeCompare(b.champion.name))
    .slice(0, count)
    .map(({ champion: relatedChampion }) => relatedChampion);
}
