import type { GuideSection } from "@/lib/types";
import { slugify } from "@/lib/utils";

const mainHeadings = new Set([
  "Primary Role",
  "Champion Identity",
  "Abilities Overview",
  "Strengths",
  "Weaknesses",
  "Recommended Rune Setup",
  "Core Item Build",
  "Situational Items",
  "Laning Phase Tips",
  "Mid Game Strategy",
  "Late Game Strategy",
  "Combos",
  "Power Spikes",
  "Teamfighting Advice",
  "Matchups and Counters",
  "General Gameplay Advice",
]);

const subHeadings = new Set([
  "Primary Tree",
  "Secondary Tree",
  "Starting Items",
  "Core Items",
  "Good Against",
  "Struggles Against",
]);

function cleanHeading(line: string) {
  return line.replace(/:$/, "").trim();
}

function isMainHeading(line: string) {
  return mainHeadings.has(cleanHeading(line));
}

function isSubHeading(line: string) {
  return subHeadings.has(cleanHeading(line));
}

function createSection(title: string, existingCount: number): GuideSection {
  const id = slugify(title) || `section-${existingCount + 1}`;

  return {
    id,
    title,
    blocks: [],
  };
}

export function parseGuideContent(raw: string) {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  const sections: GuideSection[] = [];
  let current: GuideSection | null = null;
  let index = 0;

  const ensureSection = () => {
    if (!current) {
      current = createSection("Overview", sections.length);
      sections.push(current);
    }

    return current;
  };

  while (index < lines.length) {
    const line = lines[index];

    if (!line || /^Champion:/i.test(line)) {
      index += 1;
      continue;
    }

    if (isMainHeading(line)) {
      current = createSection(cleanHeading(line), sections.length);
      sections.push(current);
      index += 1;
      continue;
    }

    if (isSubHeading(line)) {
      ensureSection().blocks.push({
        type: "subheading",
        text: cleanHeading(line),
      });
      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];

      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(lines[index].replace(/^-+\s*/, ""));
        index += 1;
      }

      ensureSection().blocks.push({
        type: "list",
        items,
      });
      continue;
    }

    ensureSection().blocks.push({
      type: "paragraph",
      text: line,
    });
    index += 1;
  }

  return sections.filter((section) => section.blocks.length > 0);
}

export function extractSectionTitles(raw: string) {
  return parseGuideContent(raw).map((section) => section.title);
}
