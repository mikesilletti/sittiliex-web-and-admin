import "server-only";
import {
  STAGE_GROUPS,
  type CommissionLine,
  type Lead,
  type Rep,
  type Scorecard,
  type StageGroupKey,
} from "./shared";

// Live rep scorecard, read straight from GoHighLevel on every request.
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
// later, which keeps each page load to a handful of GHL calls.

const API = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
const PIPELINE_ID = "Y1NDUrBSK8LfLGJLiHAv"; // SillettiX Acquisition Pipeline
const CREDITED_EMAIL_FIELD = "lDMO7lKPaa7tm63beqcP"; // Credited Rep Email
const REP_SOURCED_TAG = "rep-sourced";
const INTERNAL_TAG = "sillettix-internal";
const TZ = "America/New_York";
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
  status: Lead["status"];
  pipelineStageId: string;
  monetaryValue?: number;
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
  customFields?: { id: string; value?: unknown }[];
  searchAfter?: unknown[];
}

function config() {
  const token = process.env.GHL_API_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  return token && locationId ? { token, locationId } : null;
}

async function ghl<T>(token: string, path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: VERSION,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    const scope = /scope/i.test(text) ? " (the GHL token is missing a permission)" : "";
    throw new Error(`GHL ${path.split("?")[0]} → ${res.status}${scope}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

const monthFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
export function monthKey(iso: string | Date) {
  return monthFmt.format(typeof iso === "string" ? new Date(iso) : iso).slice(0, 7);
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
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

/** Run async work with a small concurrency cap (GHL allows ~100 requests / 10s). */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    })
  );
  return results;
}

let cache: { at: number; data: Scorecard } | null = null;

export async function getScorecard(force = false): Promise<Scorecard> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  const cfg = config();
  if (!cfg) throw new Error("GHL is not configured (GHL_API_TOKEN / GHL_LOCATION_ID)");
  const { token, locationId } = cfg;
  const warnings: string[] = [];

  const [usersRes, pipelinesRes, opportunities, contacts] = await Promise.all([
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
  ]);

  const pipeline = pipelinesRes.pipelines?.find((p) => p.id === PIPELINE_ID);
  if (!pipeline) throw new Error("Acquisition pipeline not found in GHL");
  const stages = [...pipeline.stages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const stageIndex = new Map(stages.map((s, i) => [s.id, i]));
  const indexOfName = (name: string) => stages.findIndex((s) => s.name === name);
  const groupBounds = STAGE_GROUPS.map((g) => ({ ...g, end: indexOfName(g.until) }));
  const groupFor = (i: number, status: Lead["status"]): StageGroupKey | null => {
    if (status !== "open") return null;
    return groupBounds.find((g) => i < g.end)?.key ?? null;
  };

  const users = (usersRes.users ?? []).filter((u) => u.email);
  const userById = new Map(users.map((u) => [u.id, u]));
  const userByEmail = new Map(users.map((u) => [u.email!.toLowerCase(), u]));
  const adminEmails = new Set(
    users.filter((u) => u.roles?.role === "admin").map((u) => u.email!.toLowerCase())
  );
  const contactById = new Map(contacts.map((c) => [c.id, c]));

  const reps = new Map<string, Rep>();
  const repFor = (emailRaw: string | null | undefined): Rep => {
    const email = (emailRaw ?? "").trim().toLowerCase();
    const isTeam = !email || adminEmails.has(email);
    const key = isTeam ? "team" : email;
    let rep = reps.get(key);
    if (!rep) {
      const u = isTeam ? undefined : userByEmail.get(email);
      rep = {
        key,
        name: isTeam
          ? "SillettiX team"
          : u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || email,
        email: isTeam ? null : email,
        status: isTeam ? "team" : u && !u.deleted ? "active" : users.length ? "left" : "active",
        leads: [],
        commission: [],
      };
      reps.set(key, rep);
    }
    return rep;
  };
  // every active rep shows up, even with nothing yet
  for (const u of users) if (u.roles?.role === "user" && !u.deleted) repFor(u.email);

  const now = Date.now();
  const creditOf = (o: GhlOpportunity) => {
    const c = contactById.get(o.contactId);
    const stamped = c?.customFields?.find((f) => f.id === CREDITED_EMAIL_FIELD)?.value;
    if (typeof stamped === "string" && stamped.includes("@")) return stamped;
    return userById.get(o.assignedTo ?? c?.assignedTo ?? "")?.email ?? null;
  };

  const leadName = (o: GhlOpportunity) => {
    const c = contactById.get(o.contactId);
    return [c?.firstName, c?.lastName].filter(Boolean).join(" ") || o.contact?.name || o.name || "Lead";
  };

  const financialsIdx = indexOfName("Financials Received");
  const commissionCandidates: GhlOpportunity[] = [];

  for (const o of opportunities) {
    const c = contactById.get(o.contactId);
    const tags = c?.tags ?? o.contact?.tags ?? [];
    if (tags.includes(INTERNAL_TAG)) continue;
    const idx = stageIndex.get(o.pipelineStageId) ?? 0;
    const lastMoveAt = o.lastStageChangeAt || o.updatedAt || o.createdAt;
    repFor(creditOf(o)).leads.push({
      contactId: o.contactId,
      lead: leadName(o),
      company: c?.companyName || o.contact?.companyName || "",
      stage: stages[idx]?.name ?? "Unknown",
      stageIndex: idx,
      group: groupFor(idx, o.status),
      status: o.status,
      selfSourced: tags.includes(REP_SOURCED_TAG),
      createdAt: o.createdAt,
      createdMonth: monthKey(o.createdAt),
      lastMoveAt,
      daysSinceMove: Math.floor((now - new Date(lastMoveAt).getTime()) / 86_400_000),
    });
    if (idx >= financialsIdx || o.status === "won") commissionCandidates.push(o);
  }

  const seen = new Set<string>();
  await mapLimit(commissionCandidates, 6, async (o) => {
    const res = await ghl<{ notes?: { id: string; body?: string; dateAdded: string }[] }>(
      token,
      `/contacts/${o.contactId}/notes`
    ).catch(() => ({ notes: [] }));
    for (const n of res.notes ?? []) {
      const text = stripHtml(n.body ?? "");
      if (!text.startsWith("COMMISSION") || seen.has(n.id)) continue;
      seen.add(n.id);
      const parts = text.split("|").map((p) => p.trim());
      const amount = Number((parts[1] ?? "").replace(/\D/g, "")) || 0;
      const emailPart = parts.find((p) => p.includes("@"));
      const c = contactById.get(o.contactId);
      repFor(emailPart ?? creditOf(o)).commission.push({
        kind: amount >= 1000 ? "closed" : "package",
        amount,
        lead: leadName(o),
        company: c?.companyName || o.contact?.companyName || "",
        contactId: o.contactId,
        at: n.dateAdded,
        month: monthKey(n.dateAdded),
      });
    }
  });

  // One $15 and one $5,000 per lead at most, even if a deal was moved twice.
  for (const rep of reps.values()) {
    const keep = new Map<string, CommissionLine>();
    for (const line of rep.commission.sort((a, b) => (a.at < b.at ? -1 : 1))) {
      const k = `${line.contactId}:${line.kind}`;
      if (!keep.has(k)) keep.set(k, line);
    }
    rep.commission = [...keep.values()].sort((a, b) => (a.at < b.at ? 1 : -1));
  }

  const currentMonth = monthKey(new Date());
  const monthSet = new Set<string>([currentMonth]);
  for (const rep of reps.values()) {
    rep.leads.forEach((l) => monthSet.add(l.createdMonth));
    rep.commission.forEach((c) => monthSet.add(c.month));
  }

  const data: Scorecard = {
    generatedAt: new Date().toISOString(),
    locationId,
    reps: [...reps.values()].sort(
      (a, b) =>
        Number(a.status === "team") - Number(b.status === "team") || a.name.localeCompare(b.name)
    ),
    months: [...monthSet].sort().reverse(),
    currentMonth,
    stageNames: stages.map((s) => s.name),
    warnings,
  };
  cache = { at: Date.now(), data };
  return data;
}
