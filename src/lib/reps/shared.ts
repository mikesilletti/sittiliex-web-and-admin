// Shared between the server loader (scorecard.ts) and the client view.

export const STALE_DAYS = 14;

/** Commission rules, as agreed with the reps. */
export const PACKAGE_RATE = 15;
export const CLOSED_RATE = 5000;

// Progress milestones, by stage name so a renamed ID never silently breaks them.
export const MILESTONES = [
  { key: "contacted", label: "Contacted", from: "Attempting Contact" },
  { key: "reached", label: "Owner reached", from: "Owner Reached" },
  { key: "discovery", label: "Discovery booked", from: "Discovery Call Scheduled" },
  { key: "nda", label: "NDA signed", from: "NDA Signed" },
  { key: "financials", label: "Financials in", from: "Financials Received" },
  { key: "won", label: "Closed", from: "Closed Won" },
] as const;
export type MilestoneKey = (typeof MILESTONES)[number]["key"];

/** Open deals, bucketed by the first stage that is NOT in the group. */
export const STAGE_GROUPS = [
  { key: "working", label: "Working", until: "NDA Sent" },
  { key: "nda", label: "NDA out", until: "Financials Requested" },
  { key: "financials", label: "Chasing financials", until: "Financials Received" },
  { key: "team", label: "With the team", until: "Closed Won" },
] as const;
export type StageGroupKey = (typeof STAGE_GROUPS)[number]["key"];

export interface CommissionLine {
  kind: "package" | "closed";
  amount: number;
  lead: string;
  company: string;
  contactId: string;
  at: string; // ISO
  month: string; // YYYY-MM, Eastern
}

export interface Lead {
  contactId: string;
  lead: string;
  company: string;
  stage: string;
  stageIndex: number;
  group: StageGroupKey | null;
  status: "open" | "won" | "lost" | "abandoned";
  selfSourced: boolean;
  createdAt: string;
  createdMonth: string;
  lastMoveAt: string;
  daysSinceMove: number;
}

export interface Rep {
  key: string; // email, or "team"
  name: string;
  email: string | null;
  status: "active" | "left" | "team";
  leads: Lead[];
  commission: CommissionLine[];
}

export interface Scorecard {
  generatedAt: string;
  locationId: string;
  reps: Rep[];
  months: string[]; // YYYY-MM with any activity, newest first
  currentMonth: string;
  stageNames: string[];
  warnings: string[];
}

export function ghlContactUrl(locationId: string, contactId: string) {
  return `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`;
}
