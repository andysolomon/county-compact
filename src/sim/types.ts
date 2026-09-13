import type { FormationKind, ProjectKind } from "./rules";

export type CountyId = string; // e.g. "US-GA-13067"
export type AdminId = string; // e.g. "adm:US-GA-13067"
export type CoalitionId = string;

export type Terrain = "mountain" | "piedmont" | "coastal" | "wetland";

export interface CountyStats {
  workforce: number; // W, capacity units
  agriculture: number; // A 0–6
  industry: number; // I 0–6
  commerce: number; // B 1–8
  transport: number; // T 0–3
  power: number; // E 0–3
  services: number; // H, service capacity
  support: number; // S 0–100
  autonomy: number; // U 0–100
  integration: number; // N 0–100
  offices: number; // O 0–2
}

export interface Allocation {
  agriculture: number;
  industry: number;
  services: number;
  security: number; // W assigned to formations recruited here
  project: number; // reserved by construction
  liaison: number; // reserved by scenario obligations (Bell)
  contract: number; // reserved by an operating federal contract
}

export interface ActiveProject {
  kind: ProjectKind;
  startDay: number;
  completeDay: number;
  credits: number;
  materials: number;
  reservedW: number;
}

export type BellState = "candidate" | "accepted" | "construction" | "ready" | "operating" | "mothballed" | "closed";

export interface BellFacility {
  state: BellState;
  acceptedDay?: number;
  accessDeadlineDay?: number; // E01 A: T≥2 or transport underway by 30 Jun 1942
  reviewDay?: number; // E01 B: single 90-day review
  postponedOnce?: boolean; // E02 B
  constructionStartDay?: number;
  constructionDays?: number; // 395
  closedReason?: string;
}

export interface Formation {
  id: string;
  kind: FormationKind;
  ownerAdminId: AdminId;
  countyId: CountyId;
  homeCountyId: CountyId;
  strength: number; // 0–100
  morale: number; // 0–100
}

export interface County {
  id: CountyId;
  name: string;
  seat: string;
  terrain: Terrain;
  stats: CountyStats;
  allocation: Allocation;
  ownerAdminId: AdminId;
  occupierAdminId?: AdminId;
  occupationDays?: number;
  project?: ActiveProject;
  bell?: BellFacility;
  autonomyFloor?: { value: number; untilDay: number };
  tier: "authored" | "estimated";
}

export interface EmergencyNote {
  issuedDay: number;
  maturesDay: number;
  principal: number;
}

export interface RelationRecord {
  relations: number; // R −100..100
  trust: number; // Q 0..100
  influence: number; // 0..100
  alarm: number; // expansion alarm toward this actor 0..100
  lastImproveDay?: number;
  improveGained?: number;
}

export interface DiplomaticAction {
  id: string;
  kind: "improve-relations" | "coalition-motion";
  targetAdminId: AdminId;
  startDay: number;
  endDay: number;
}

export interface Administration {
  id: AdminId;
  name: string;
  seatCountyId: CountyId;
  counties: CountyId[];
  treasury: number;
  materials: number;
  notes: EmergencyNote[];
  arrears: number;
  standing: number; // Federal Standing 0–100
  exhaustion: number; // 0–100
  coalitionId?: CoalitionId;
  relations: Record<AdminId, RelationRecord>;
  actions: DiplomaticAction[];
  isPlayer: boolean;
  revenueEffort: "standard" | "relief" | "emergency";
  peacefulMonths: number;
  profile: "industrial" | "agricultural" | "small-defensive" | "expansionist" | "commercial";
  truces: Record<AdminId, number>; // until day
  lastSettlement?: { day: number; revenue: number; expenditure: number; net: number; materials: number; treasuryAfter: number };
}

export type VoteChoice = "yes" | "no" | "pending";

export interface MotionVote {
  vote: VoteChoice;
  reason: string;
  decidesDay: number;
}

export interface AcceptanceTerm {
  label: string;
  symbol?: string;
  value: number;
}

export interface AcceptanceForecast {
  terms: AcceptanceTerm[];
  score: number;
  threshold: number;
  likely: boolean;
  hardGates: { label: string; met: boolean }[];
  gatesMet: boolean;
}

export interface CoalitionMotion {
  id: string;
  kind: "admit";
  coalitionId: CoalitionId;
  proposerAdminId: AdminId;
  applicantAdminId: AdminId;
  openedDay: number;
  closesDay: number;
  votes: Record<AdminId, MotionVote>;
  status: "voting" | "passed" | "failed" | "withdrawn";
  resolutionNote?: string;
}

export interface Coalition {
  id: CoalitionId;
  name: string;
  color: string;
  chairAdminId: AdminId;
  members: AdminId[];
  cohesion: number;
  commonFund: number;
  motion?: CoalitionMotion;
  priority: string;
}

export interface Occupation {
  countyId: CountyId;
  occupierAdminId: AdminId;
  days: number; // completed days held
}

export interface Claim {
  countyId: CountyId;
  claimantAdminId: AdminId;
  registeredDay: number;
}

export interface War {
  id: string;
  aggressorAdminId: AdminId;
  defenderAdminIds: AdminId[];
  goal: { kind: "claim"; countyId: CountyId } | { kind: "access"; countyId: CountyId } | { kind: "release"; adminId: AdminId };
  startDay: number;
  lastBattleDay?: number;
  battles: { aggressorWins: number; defenderWins: number };
  prewarCounties: Record<AdminId, number>;
  registered: boolean;
  status: "active" | "settled";
}

export interface DecisionInstance {
  id: string;
  eventId: "E01" | "E02" | "E01-review";
  firedDay: number;
  deadlineDay: number;
  countyId: CountyId;
  adminId: AdminId;
}

export interface LedgerEntry {
  day: number;
  eventId: string;
  category: "historical" | "conditional" | "fiction" | "abstraction" | "outcome";
  text: string;
}

export interface LogEntry {
  day: number;
  text: string;
  kind: "info" | "completion" | "decision" | "alert" | "diplomacy";
}

export interface GameState {
  rulesetVersion: string;
  seed: number;
  day: number;
  paused: boolean;
  speed: 1 | 4 | 12;
  pauseOnCompletion: boolean;
  playerAdminId: AdminId;
  scenario: "cobb-1942" | "training-bartow-1944";
  counties: Record<CountyId, County>;
  admins: Record<AdminId, Administration>;
  coalitions: Record<CoalitionId, Coalition>;
  formations: Record<string, Formation>;
  wars: War[];
  claims: Claim[];
  occupations: Occupation[];
  pendingDecisions: DecisionInstance[];
  ledger: LedgerEntry[];
  log: LogEntry[];
  nextId: number;
  ambition: "regional-union" | "commonwealth";
}
