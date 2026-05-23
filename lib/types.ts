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

export type Rune = {
  id: number;
  key: string;
  name: string;
  icon: string;
  shortDesc: string;
  longDesc: string;
};

export type RuneTree = RunePath & {
  slots: Array<{
    runes: Rune[];
  }>;
};

export type RuneSelection = Rune & {
  path: string;
  slot: number;
};

export type RuneShard = {
  id: number;
  name: string;
  category: "offense" | "flex" | "defense";
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

export type ItemBuildEntry = ChampionItem & {
  winRate: number;
  pickRate: number;
  matchCount: number;
  timing: string;
  purchaseOrderFrequency: number;
  explanation: string;
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

export type RunePage = {
  id: string;
  label: string;
  style: "highest-win" | "popular" | "pro" | "situational";
  primaryPath: RunePath;
  secondaryPath: RunePath;
  primaryRunes: RuneSelection[];
  secondaryRunes: RuneSelection[];
  shards: RuneShard[];
  winRate: number;
  pickRate: number;
  matchCount: number;
  note: string;
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

export type MatchupStat = MatchupChampion & {
  winRate: number;
  laneKillRate: number;
  goldDiffAt15: number;
  xpDiffAt15: number;
  csDiffAt15: number;
  matchCount: number;
  difficulty: "Easy" | "Playable" | "Hard";
  note: string;
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
    matchCount?: number | null;
    tier?: string | null;
    tierRank?: number | null;
    rolePopularity?: number | null;
    rank?: string | null;
    region?: string | null;
    patch?: string | null;
    source: string | null;
  };
  searchText: string;
};

export type AdvancedMetric = {
  key: string;
  label: string;
  value: number;
  description: string;
};

export type GameLengthStat = {
  bucket: string;
  winRate: number;
  rating: number;
  note: string;
};

export type BuildTimelineStep = {
  label: string;
  minute: string;
  items: ItemBuildEntry[];
};

export type ItemBuildProfile = {
  startingItems: ItemBuildEntry[];
  firstRecallItems: ItemBuildEntry[];
  bootsOptions: ItemBuildEntry[];
  coreBuild: ItemBuildEntry[];
  fullBuild: ItemBuildEntry[];
  situationalItems: ItemBuildEntry[];
  antiHealOptions: ItemBuildEntry[];
  defensiveOptions: ItemBuildEntry[];
  snowballBuilds: ItemBuildEntry[];
  lateGameSellOptions: ItemBuildEntry[];
  timeline: BuildTimelineStep[];
};

export type CoachingSection = {
  title: string;
  points: string[];
};

export type ChampionCompetitiveProfile = {
  patch: string;
  region: string;
  rank: string;
  role: RoleName;
  tier: string;
  tierRank: number;
  matchCount: number;
  winRate: number;
  pickRate: number;
  banRate: number;
  rolePopularity: number;
  earlyGameRating: number;
  midGameRating: number;
  lateGameRating: number;
  snowballStrength: number;
  scalingScore: number;
  teamfightRating: number;
  objectiveControlRating: number;
  roamingEffectiveness: number;
  laneDominanceScore: number;
  carryPotentialScore: number;
  metrics: AdvancedMetric[];
  gameLength: GameLengthStat[];
  patchTrend: string;
  metaEvolution: string;
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
    runePages: RunePage[];
    summonerSpells: SummonerSpell[];
    coreItems: ChampionItem[];
    situationalItems: ChampionItem[];
    itemBuild: ItemBuildProfile;
  };
  competitive: ChampionCompetitiveProfile;
  coaching: {
    micro: CoachingSection[];
    macro: CoachingSection[];
    highElo: CoachingSection[];
    pro: CoachingSection[];
  };
  matchups: {
    slug: string;
    strongAgainst: MatchupStat[];
    weakAgainst: MatchupStat[];
  };
};

export type ChampionDatabase = {
  version: string;
  generatedAt: string;
  expectedChampionCount: number;
  championCount: number;
  runePaths: RunePath[];
  runeTrees: RuneTree[];
  roleTabs: RoleName[];
  classTabs: ChampionClassName[];
  champions: ChampionRecord[];
};
