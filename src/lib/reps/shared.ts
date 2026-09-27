// Shared between the server loader (scorecard.ts) and the client reports app.

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

export const SOURCES = ["Facebook ads", "Website", "Rep-sourced", "Other"] as const;
export type Source = (typeof SOURCES)[number];

// Answer options from the Facebook / website prequalification form, in order.
export const REVENUE_BANDS = [
  "Under $250,000",
  "$250,000 - $500,000",
  "$500,000 - $1 million",
  "$1 million - $2 million",
  "$2 million - $5 million",
  "$5 million+",
  "Not given",
];
export const PROFIT_BANDS = REVENUE_BANDS;
export const TIMELINES = [
  "As soon as possible",
  "Within 3 months",
  "3-6 months",
  "6-12 months",
  "More than 12 months",
  "Just exploring",
  "Not given",
];
export const ASKING_BANDS = ["Under $250k", "$250k - $500k", "$500k - $1M", "$1M - $5M", "$5M+", "Not given"];
export const INDUSTRY_GROUPS = [
  "Home services",
  "Automotive",
  "Food & beverage",
  "Retail",
  "Health & beauty",
  "Transportation",
  "Manufacturing",
  "Professional services",
  "Hospitality & leisure",
  "Other",
  "Not given",
];

export type CallStatus = "upcoming" | "held" | "no-show" | "cancelled" | "unmarked";

export interface Deal {
  id: string;
  contactId: string;
  lead: string;
  company: string;
  repKey: string;
  source: Source;
  industry: string; // group
  industryRaw: string;
  state: string; // 2-letter, or "Unknown"
  locationRaw: string;
  revenue: string;
  profit: string;
  timeline: string;
  books: string; // raw answer, or "Not given"
  asking: string; // band
  askingValue: number | null;
  stage: string;
  stageId: string;
  stageIndex: number;
  group: StageGroupKey | null;
  status: "open" | "won" | "lost" | "abandoned";
  createdAt: string;
  lastMoveAt: string;
  lastActivityAt: string | null;
}

export interface CommissionLine {
  kind: "package" | "closed";
  amount: number;
  contactId: string;
  repKey: string;
  at: string; // ISO
}

export interface Call {
  id: string;
  contactId: string;
  repKey: string;
  start: string; // ISO
  status: CallStatus;
  calendar: string;
}

export interface Rep {
  key: string; // email, or "team"
  name: string;
  email: string | null;
  status: "active" | "left" | "team";
}

export interface ReportData {
  generatedAt: string;
  locationId: string;
  reps: Rep[];
  deals: Deal[];
  commission: CommissionLine[];
  calls: Call[];
  stageNames: string[];
  stages: { id: string; name: string }[];
  warnings: string[];
}

export function ghlContactUrl(locationId: string, contactId: string) {
  return `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`;
}

// Chart colors, validated for the admin's dark surface (#0d1117) with the
// dataviz palette validator: categorical passes CVD/normal-vision/contrast,
// the ordinal ramp is one hue, monotone, light end >= 3:1.
export const SOURCE_COLORS: Record<Source, string> = {
  "Facebook ads": "#3987e5",
  Website: "#d95926",
  "Rep-sourced": "#199e70",
  Other: "#c98500",
};
export const ORDINAL_RAMP = ["#9ec5f4", "#6da7ec", "#3987e5", "#256abf"]; // light -> dark
export const STATUS = { good: "#0ca30c", warning: "#fab219", critical: "#d03b3b" };

// ------------------------------------------------------------------ deals workspace

/** What moving a deal into each stage sets off in GoHighLevel (the stage workflows). */
export const STAGE_EFFECTS: Record<string, string> = {
  "New Lead": "Alerts the owner and creates a first-call task.",
  "Attempting Contact": "Starts the no-answer sequence: Day 1, 7 and 14 texts and emails (sent 11am–7pm).",
  "Owner Reached": "Stops the no-answer sequence and alerts the owner.",
  "Initial Qualification": "Stops the no-answer sequence and creates the qualification task.",
  "Discovery Call Scheduled": "Stops the no-answer sequence and emails the seller a booking confirmation.",
  "Discovery Call Completed": "Creates the follow-up task.",
  "NDA Sent": "Sends the seller the NDA to sign, a heads-up text, and reminders until it's signed.",
  "NDA Signed": "Stops the NDA reminders and moves the deal straight on to Financials Requested.",
  "Financials Requested": "Emails and texts the seller the financials request, with reminders every 3 days.",
  "Financials Received": "Accepts the financial package: logs the credited rep's $15, hands the lead to the team and stops the financials reminders.",
  "LOI Accepted": "Emails and texts the seller the due-diligence checklist.",
  "Closing Scheduled": "Emails and texts the seller the closing checklist.",
  "Closed Won": "Marks the deal won, logs the credited rep's $5,000 and stops every sequence.",
  "Closed Lost": "Marks the deal lost and stops every sequence.",
};
export const DEFAULT_STAGE_EFFECT = "Creates this stage's task and alerts the owner.";

export interface DealDetail {
  phone: string | null;
  email: string | null;
  city: string | null;
  website: string | null;
  tags: string[];
  dateAdded: string | null;
  notes: { id: string; body: string; at: string }[];
  tasks: { id: string; title: string; due: string | null; done: boolean }[];
}
