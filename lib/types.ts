export type RoleName = "Top" | "Jungle" | "Mid" | "ADC" | "Support";

export type ChampionClassName =
  | "Assassin"
  | "Mage"
  | "Fighter"
  | "Tank"
  | "Marksman"
  | "Support";

export type DifficultyLabel = "Beginner" | "Intermediate" | "Advanced";

export type RunePath = {
  id: number;
  key: string;
  name: string;
  icon: string;
};

export type ChampionAsset = {
  icon: string;
  splash: string;
  loading: string;
  universe: string | null;
};

export type ChampionAbility = {
  slot: "P" | "Q" | "W" | "E" | "R";
  name: string;
  description: string;
  cooldown?: string;
  cost?: string;
  range?: string;
  icon: string;
};

export type ChampionItem = {
  id: string;
  name: string;
  plaintext: string;
  tags: string[];
  icon: string;
};

export type SummonerSpell = {
  key: string;
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
};

export type RuneRecommendation = {
  primaryPath: string;
  secondaryPath: string;
  keystone: {
    id: number;
    key: string;
    name: string;
    icon: string;
  } | null;
};

export type ChampionStats = {
  hp: number;
  hpPerLevel: number;
  resource: number;
  resourcePerLevel: number;
  attackDamage: number;
  attackDamagePerLevel: number;
  abilityPower: number;
  armor: number;
  armorPerLevel: number;
  magicResist: number;
  magicResistPerLevel: number;
  moveSpeed: number;
  attackRange: number;
  attackSpeed: number;
};

export type MatchupChampion = {
  slug: string;
  name: string;
  icon: string;
};

export type ChampionSummary = {
  id: string;
  key: string;
  slug: string;
  name: string;
  title: string;
  blurb: string;
  roles: RoleName[];
  primaryRole: RoleName;
  classes: {
    primary: ChampionClassName;
    secondary: ChampionClassName | null;
    archetypes: string[];
  };
  region: string;
  regionSlug: string;
  releaseDate: string;
  resource: string;
  rangeType: string;
  difficulty: {
    value: number;
    label: DifficultyLabel;
  };
  icon: string;
  images: ChampionAsset;
  liveStats: {
    winRate: number | null;
    pickRate: number | null;
    banRate: number | null;
    source: string | null;
  };
  searchText: string;
};

export type ChampionRecord = ChampionSummary & {
  lore: string;
  releasePatch: string | null;
  ratings: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
    damage: number | null;
    toughness: number | null;
    control: number | null;
    mobility: number | null;
    utility: number | null;
    style: number | null;
  };
  stats: ChampionStats;
  abilities: ChampionAbility[];
  recommendations: {
    skillOrder: Array<"Q" | "W" | "E">;
    runePage: RuneRecommendation;
    summonerSpells: SummonerSpell[];
    coreItems: ChampionItem[];
    situationalItems: ChampionItem[];
  };
  sources: {
    riotDataDragon: string;
    riotUniverse: string | null;
    leagueWiki: string;
  };
  matchups: {
    slug: string;
    strongAgainst: MatchupChampion[];
    weakAgainst: MatchupChampion[];
  };
};

export type MapSystemData = {
  lanes: Array<{
    role: RoleName;
    assignment: string;
  }>;
  objectiveTimers: Array<{
    objective: string;
    firstSpawn: string;
    respawn: string;
  }>;
  csGuide: Array<{
    role: RoleName;
    target: string;
  }>;
  junglePaths: string[];
};

export type ChampionDatabase = {
  version: string;
  generatedAt: string;
  expectedChampionCount: number;
  championCount: number;
  sources: string[];
  runePaths: RunePath[];
  roleTabs: RoleName[];
  classTabs: ChampionClassName[];
  mapSystems: MapSystemData;
  champions: ChampionRecord[];
};
