import "server-only";
import {
  PROFIT_BANDS,
  REVENUE_BANDS,
  STAGE_GROUPS,
  TIMELINES,
  type Call,
  type CallStatus,
  type CommissionLine,
  type Deal,
  type ReportData,
  type Rep,
  type Source,
  type StageGroupKey,
} from "./shared";
import { askingBand, askingValue, formBand, industryGroup, stateOf } from "./normalize";

// Live rep reporting, read straight from GoHighLevel on every request.
//
// How GHL records commission (built in the SillettiX location, 2026-09-26):
//   - every lead carries a "Credited Rep Email" contact field, stamped when the
//     lead is first owned by someone and never changed afterwards, so the rep
//     keeps credit after the deal is handed to the internal team
//   - when the team moves a deal to Financials Received, a workflow writes a
//     contact note  "COMMISSION | $15 | Financial package received | Credited rep: Name | email"
//   - at Closed Won:  "COMMISSION | $5000 | Deal closed won | ..."
//   - reps are GHL users with role "user"; admins are the internal team
//   - leads a rep added themselves are tagged "rep-sourced"
// Notes are only fetched for deals that have reached Financials Received or
// later, which keeps each load to a handful of GHL calls.

const API = "https://services.leadconnectorhq.com";
const PIPELINE_ID = "Y1NDUrBSK8LfLGJLiHAv"; // SillettiX Acquisition Pipeline
const CALENDARS: Record<string, string> = {
  "20Zz3ZEF9GfQMWkpqKNQ": "Discovery call",
  PYogOSyHzLrhK7XsdnHe: "Personal calendar",
};
// Contact custom fields (the Prequalification Form section).
const FIELD = {
  creditedEmail: "lDMO7lKPaa7tm63beqcP",
  industry: "G5KaNJyvGdncHyiTHplt",
  location: "uBJF8aclX23O7nJyfazh",
  revenue: "NdRT69iiTD62oBATEUg6",
  profit: "sYDlwDtCWs2S8PxfkIAl",
  timing: "FJ4N0gAzHSYLYU76BTtA",
  asking: "l8Jvrz6GOtP9ZQ8mQAwI",
};
const REP_SOURCED_TAG = "rep-sourced";
const INTERNAL_TAG = "sillettix-internal";
const CACHE_MS = 15_000;

interface GhlUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  deleted?: boolean;
  roles?: { role?: string };
}

interface GhlOpportunity {
  id: string;
  name?: string;
  contactId: string;
  assignedTo?: string | null;
  status: Deal["status"];
  pipelineStageId: string;
  createdAt: string;
  updatedAt?: string;
  lastStageChangeAt?: string;
  contact?: { id: string; name?: string; companyName?: string; tags?: string[] };
}

interface GhlContact {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  assignedTo?: string | null;
  tags?: string[];
  source?: string | null;
  state?: string | null;
  phone?: string | null;
  lastActivity?: number | string | null;
  customFields?: { id: string; value?: unknown }[];
  searchAfter?: unknown[];
}

interface GhlEvent {
  id: string;
  contactId?: string;
  assignedUserId?: string;
  startTime: string;
  appointmentStatus?: string;
  deleted?: boolean;
}

function config() {
  const token = process.env.GHL_API_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  return token && locationId ? { token, locationId } : null;
}

async function ghl<T>(
  token: string,
  path: string,
  init?: { method?: string; body?: unknown; version?: string }
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: init?.version ?? "2021-07-28",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    const scope = /scope|not authorized/i.test(text) ? " (the GHL key is missing a permission)" : "";
    throw new Error(`GHL ${path.split("?")[0]} → ${res.status}${scope}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

async function loadAllOpportunities(token: string, locationId: string) {
  const out: GhlOpportunity[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await ghl<{ opportunities?: GhlOpportunity[] }>(
      token,
      `/opportunities/search?location_id=${locationId}&pipeline_id=${PIPELINE_ID}&limit=100&page=${page}`
    );
    const batch = res.opportunities ?? [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

async function loadAllContacts(token: string, locationId: string) {
  const out: GhlContact[] = [];
  let searchAfter: unknown[] | undefined;
  for (let i = 0; i < 100; i++) {
    const res = await ghl<{ contacts?: GhlContact[] }>(token, "/contacts/search", {
      method: "POST",
      body: { locationId, pageLimit: 100, ...(searchAfter ? { searchAfter } : {}) },
    });
    const batch = res.contacts ?? [];
    out.push(...batch);
    if (batch.length < 100) break;
    searchAfter = batch[batch.length - 1].searchAfter;
  }
  return out;
}

async function loadCalls(token: string, locationId: string, warnings: string[]) {
  const start = Date.now() - 540 * 86_400_000; // 18 months back
  const end = Date.now() + 120 * 86_400_000;
  const all: (GhlEvent & { calendar: string })[] = [];
  await Promise.all(
    Object.entries(CALENDARS).map(async ([calendarId, calendar]) => {
      try {
        const res = await ghl<{ events?: GhlEvent[] }>(
          token,
          `/calendars/events?locationId=${locationId}&calendarId=${calendarId}&startTime=${start}&endTime=${end}`,
          { version: "2021-04-15" }
        );
        for (const e of res.events ?? []) if (!e.deleted) all.push({ ...e, calendar });
      } catch (e) {
        warnings.push(`Couldn't read the ${calendar} (${(e as Error).message}); call numbers are missing.`);
      }
    })
  );
  return all;
}

/** Run async work with a small concurrency cap (GHL allows ~100 requests / 10s). */
async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]);
    })
  );
}

function callStatus(raw: string | undefined, startIso: string): CallStatus {
  const s = (raw ?? "").toLowerCase();
  if (s === "showed") return "held";
  if (s === "noshow") return "no-show";
  if (s === "cancelled" || s === "invalid") return "cancelled";
  return new Date(startIso).getTime() > Date.now() ? "upcoming" : "unmarked";
}

let cache: { at: number; data: ReportData } | null = null;

export async function getReportData(): Promise<ReportData> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  const cfg = config();
  if (!cfg) throw new Error("GHL is not configured (GHL_API_TOKEN / GHL_LOCATION_ID)");
  const { token, locationId } = cfg;
  const warnings: string[] = [];

  const [usersRes, pipelinesRes, opportunities, contacts, events] = await Promise.all([
    ghl<{ users?: GhlUser[] }>(token, `/users/?locationId=${locationId}`).catch((e: Error) => {
      warnings.push(`Couldn't read GHL users (${e.message}); reps are shown by email.`);
      return { users: [] as GhlUser[] };
    }),
    ghl<{ pipelines?: { id: string; stages: { id: string; name: string; position?: number }[] }[] }>(
      token,
      `/opportunities/pipelines?locationId=${locationId}`
    ),
    loadAllOpportunities(token, locationId),
    loadAllContacts(token, locationId),
    loadCalls(token, locationId, warnings),
  ]);

  const pipeline = pipelinesRes.pipelines?.find((p) => p.id === PIPELINE_ID);
  if (!pipeline) throw new Error("Acquisition pipeline not found in GHL");
  const stages = [...pipeline.stages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const stageIndex = new Map(stages.map((s, i) => [s.id, i]));
  const indexOfName = (name: string) => stages.findIndex((s) => s.name === name);
  const groupBounds = STAGE_GROUPS.map((g) => ({ key: g.key, end: indexOfName(g.until) }));
  const groupFor = (i: number, status: Deal["status"]): StageGroupKey | null =>
    status === "open" ? (groupBounds.find((g) => i < g.end)?.key ?? null) : null;

  // ---- reps
  const users = (usersRes.users ?? []).filter((u) => u.email);
  const userById = new Map(users.map((u) => [u.id, u]));
  const userByEmail = new Map(users.map((u) => [u.email!.toLowerCase(), u]));
  const adminEmails = new Set(users.filter((u) => u.roles?.role === "admin").map((u) => u.email!.toLowerCase()));
  const reps = new Map<string, Rep>();
  const repKey = (emailRaw: string | null | undefined): string => {
    const email = (emailRaw ?? "").trim().toLowerCase();
    const key = !email || adminEmails.has(email) ? "team" : email;
    if (!reps.has(key)) {
      const u = key === "team" ? undefined : userByEmail.get(email);
      reps.set(key, {
        key,
        name:
          key === "team"
            ? "SillettiX team"
            : u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || email,
        email: key === "team" ? null : email,
        status: key === "team" ? "team" : u && !u.deleted ? "active" : users.length ? "left" : "active",
      });
    }
    return key;
  };
  for (const u of users) if (u.roles?.role === "user" && !u.deleted) repKey(u.email);

  // ---- deals
  const contactById = new Map(contacts.map((c) => [c.id, c]));
  const field = (c: GhlContact | undefined, id: string) => {
    const v = c?.customFields?.find((f) => f.id === id)?.value;
    return typeof v === "string" ? v.trim() : "";
  };
  const deals: Deal[] = [];
  const repOfContact = new Map<string, string>();
  const financialsIdx = indexOfName("Financials Received");
  const commissionCandidates: string[] = [];

  for (const o of opportunities) {
    const c = contactById.get(o.contactId);
    const tags = c?.tags ?? o.contact?.tags ?? [];
    if (tags.includes(INTERNAL_TAG)) continue;
    const stamped = field(c, FIELD.creditedEmail);
    const owner = userById.get(o.assignedTo ?? c?.assignedTo ?? "")?.email;
    const key = repKey(stamped.includes("@") ? stamped : owner);
    repOfContact.set(o.contactId, key);
    const src = (c?.source ?? "").toLowerCase();
    const source: Source = tags.includes(REP_SOURCED_TAG)
      ? "Rep-sourced"
      : src.includes("website") || tags.includes("website-sell")
        ? "Website"
        : src.includes("facebook")
          ? "Facebook ads"
          : "Other";
    const idx = stageIndex.get(o.pipelineStageId) ?? 0;
    const industryRaw = field(c, FIELD.industry);
    const locationRaw = field(c, FIELD.location);
    const askingRaw = field(c, FIELD.asking);
    const av = askingValue(askingRaw);
    const lastActivity = c?.lastActivity ? new Date(c.lastActivity).toISOString() : null;
    deals.push({
      id: o.id,
      contactId: o.contactId,
      lead: [c?.firstName, c?.lastName].filter(Boolean).join(" ") || o.contact?.name || o.name || "Lead",
      company: c?.companyName || o.contact?.companyName || "",
      repKey: key,
      source,
      industry: industryGroup(industryRaw),
      industryRaw,
      state: stateOf(locationRaw, c?.state, c?.phone),
      locationRaw,
      revenue: formBand(field(c, FIELD.revenue), REVENUE_BANDS),
      profit: formBand(field(c, FIELD.profit), PROFIT_BANDS),
      timeline: formBand(field(c, FIELD.timing), TIMELINES),
      asking: askingBand(av),
      askingValue: av,
      stage: stages[idx]?.name ?? "Unknown",
      stageIndex: idx,
      group: groupFor(idx, o.status),
      status: o.status,
      createdAt: o.createdAt,
      lastMoveAt: o.lastStageChangeAt || o.updatedAt || o.createdAt,
      lastActivityAt: lastActivity,
    });
    if (idx >= financialsIdx || o.status === "won") commissionCandidates.push(o.contactId);
  }

  // ---- commission notes (only deals that could have earned any)
  const commission: CommissionLine[] = [];
  const seen = new Set<string>();
  await mapLimit([...new Set(commissionCandidates)], 6, async (contactId) => {
    const res = await ghl<{ notes?: { id: string; body?: string; dateAdded: string }[] }>(
      token,
      `/contacts/${contactId}/notes`
    ).catch(() => ({ notes: [] }));
    const notes = [...(res.notes ?? [])].sort((a, b) => (a.dateAdded < b.dateAdded ? -1 : 1));
    for (const n of notes) {
      const text = (n.body ?? "").replace(/<[^>]+>/g, "").trim();
      if (!text.startsWith("COMMISSION")) continue;
      const parts = text.split("|").map((p) => p.trim());
      const amount = Number((parts[1] ?? "").replace(/\D/g, "")) || 0;
      const kind = amount >= 1000 ? "closed" : "package";
      const dedupe = `${contactId}:${kind}`; // one of each per deal, even if moved twice
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      const emailPart = parts.find((p) => p.includes("@"));
      commission.push({
        kind,
        amount,
        contactId,
        repKey: emailPart ? repKey(emailPart) : (repOfContact.get(contactId) ?? "team"),
        at: n.dateAdded,
      });
    }
  });

  // ---- discovery calls
  const calls: Call[] = events
    .filter((e) => e.contactId)
    .map((e) => ({
      id: e.id,
      contactId: e.contactId!,
      repKey: repOfContact.get(e.contactId!) ?? repKey(userById.get(e.assignedUserId ?? "")?.email),
      start: new Date(e.startTime).toISOString(),
      status: callStatus(e.appointmentStatus, e.startTime),
      calendar: e.calendar,
    }));

  const data: ReportData = {
    generatedAt: new Date().toISOString(),
    locationId,
    reps: [...reps.values()].sort(
      (a, b) => Number(a.key === "team") - Number(b.key === "team") || a.name.localeCompare(b.name)
    ),
    deals,
    commission,
    calls,
    stageNames: stages.map((s) => s.name),
    warnings,
  };
  cache = { at: Date.now(), data };
  return data;
}
