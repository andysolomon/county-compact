// Proposed balancing values from the game design (GDD §6). All are gameplay
// abstractions, not historical measurements. Ruleset version is saved with state.

export const RULESET_VERSION = "0.1.0";

export const ECONOMY = {
  agricultureCreditsPerLevel: 4,
  industryCreditsPerLevel: 6,
  industryMaterialsPerLevel: 2,
  civilianMaterialAllotment: 2,
  allotmentMinStanding: 40,
  servicesCostPerW: 2,
  adminCostPerCounty: 2,
  adminCostPerOffice: 1,
  nationalServicePerCountyWartime: 2,
  nationalServicePerCountyPostwar: 1,
  coalitionDues: 1,
  occupationCostPerCounty: 2,
  integrationMonthly: 2,
  integrationStart: 15,
  materialPrice: 3,
  materialCapPerMonth: 6,
  emergencyNote: 50,
  noteInterest: 1,
  noteMaturityMonths: 18,
  baseAdminCapacity: 6,
  capacityPerOffice: 3,
  constructionReservedW: 2,
} as const;

export const SUPPORT = {
  peacefulRecovery: 1,
  crowdingPenalty: -2,
  unstaffedServicesPenalty: -3,
  unpaidServicesPenalty: -3,
  petitionUnrest: 50,
  noncooperationUnrest: 70,
} as const;

export const DIPLOMACY = {
  ordinaryThreshold: 25,
  majorThreshold: 35,
  relationsWeight: 0.4,
  trustWeight: 0.3,
  alarmWeight: 0.3,
  atWarPenalty: 20,
  autonomyCost: { access: 0, nonaggression: 0, trade: 5, alliance: 15, coalition: 15, dependency: 35, integration: 45 } as const,
  improveRelationsCost: 5,
  improveRelationsDays: 30,
  improveRelationsGain: 10,
  improveRelationsCooldownDays: 90,
  improveRelationsCap: 60,
  actionSlots: 2,
  proposalDays: 30,
} as const;

export const COALITION = {
  startingCohesion: 65,
  cohesionMonthlyGain: 1,
  cohesionUnpaidPenalty: -2,
  cohesionUnpaidCap: -6,
  recruitmentMinCohesion: 40,
  weeklyEvaluationDays: 7,
} as const;

export const WAR = {
  occupationScoreShare: 50,
  goalCountyScore: 25,
  battleScoreEach: 5,
  battleScoreCap: 25,
  cessionBase: 20,
  cessionPerIndustry: 2,
  reparationsPerPoint: 2,
  reparationsMin: 10,
  reparationsMax: 30,
  accessEnforcementCost: 10,
  releaseDependencyCost: 30,
  dependencyTermsCost: 40,
  maxCessionsPerWar: 2,
  loserExhaustionForAcceptance: 40,
  whitePeaceQuietDays: 90,
  arbitrationDay: 180,
  truceMonths: 24,
  forcedCessionSupportPenalty: 20,
  forcedCessionAutonomy: 80,
  forcedCessionAutonomyFloor: 60,
  forcedCessionFloorMonths: 24,
  cessionStandingPenalty: 5,
  exhaustionPeaceRecovery: 5,
} as const;

export const STANDING = {
  start: 70,
  contractsMin: 40,
  registeredWarStart: -10,
  aggressorMonthly: -2,
  peacefulTriadBonus: 3,
} as const;

export interface ProjectDefinition {
  readonly id: ProjectKind;
  readonly label: string;
  readonly credits: number;
  readonly materials: number;
  readonly days: number;
  readonly description: string;
}

export type ProjectKind = "agriculture" | "workshop" | "transport" | "power" | "housing" | "office";

export const PROJECTS: readonly ProjectDefinition[] = [
  { id: "transport", label: "Transport improvement", credits: 36, materials: 10, days: 90, description: "+1 transport level; +1 C monthly upkeep. Capacity, not map adjacency." },
  { id: "housing", label: "Housing and public services", credits: 30, materials: 6, days: 60, description: "+4 service capacity; no automatic workforce." },
  { id: "agriculture", label: "Agricultural improvement", credits: 24, materials: 4, days: 60, description: "+1 agriculture level; staffing still required." },
  { id: "workshop", label: "Industrial workshop", credits: 45, materials: 12, days: 90, description: "+1 industry level; needs power 1 and transport 1." },
  { id: "power", label: "Power extension", credits: 36, materials: 10, days: 90, description: "+1 power level; +1 C monthly upkeep." },
  { id: "office", label: "Administrative office", credits: 30, materials: 6, days: 60, description: "+3 administrative capacity; +1 C monthly upkeep." },
];

export const FORMATIONS = {
  battalion: { label: "Security battalion", power: 10, upkeep: 3, credits: 20, materials: 4, days: 30, workforce: 1 },
  regiment: { label: "Mobile regiment", power: 14, upkeep: 5, credits: 35, materials: 10, days: 45, workforce: 1.5 },
  engineer: { label: "Engineer company", power: 4, upkeep: 3, credits: 25, materials: 8, days: 30, workforce: 0.5 },
} as const;

export type FormationKind = keyof typeof FORMATIONS;
