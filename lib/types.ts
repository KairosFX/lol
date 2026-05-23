export type ChampionMeta = {
  slug: string;
  name: string;
  fileName: string;
  initials: string;
  role: string;
  identity: string;
  excerpt: string;
  sectionTitles: string[];
  wordCount: number;
  searchText: string;
  accent: {
    from: string;
    to: string;
  };
};

export type ChampionGuide = ChampionMeta & {
  content: string;
};

export type GuideBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "subheading";
      text: string;
    };

export type GuideSection = {
  id: string;
  title: string;
  blocks: GuideBlock[];
};
