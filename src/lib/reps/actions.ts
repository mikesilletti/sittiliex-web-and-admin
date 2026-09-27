"use server";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { invalidateReportCache } from "./scorecard";
import type { DealDetail } from "./shared";

// Deal actions used by the Rep Reports "Deals" workspace. Each one writes to
// GoHighLevel exactly as a person would in GHL itself, so the stage
// workflows (texts, emails, commission notes) fire the same way.

const API = "https://services.leadconnectorhq.com";
const PIPELINE_ID = "Y1NDUrBSK8LfLGJLiHAv"; // SillettiX Acquisition Pipeline
const TEAM_EMAIL = "deals@sillettix.com"; // the "SillettiX Deals" user that owns handed-off deals
const ID = /^[A-Za-z0-9_-]{6,64}$/;

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

function config() {
  const token = process.env.GHL_API_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!token || !locationId) throw new Error("GoHighLevel isn't configured");
  return { token, locationId };
}

async function ghl<T>(path: string, init?: { method?: string; body?: unknown; version?: string }): Promise<T> {
  const { token } = config();
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
  if (!res.ok) throw new Error(`GoHighLevel said ${res.status}${/scope|authorized/i.test(text) ? " (missing permission)" : ""}`);
  return (text ? JSON.parse(text) : {}) as T;
}

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    await requireAdminSession();
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "Something went wrong" };
  }
}

function assertId(...ids: string[]) {
  for (const id of ids) if (!ID.test(id)) throw new Error("Invalid id");
}

async function stageIdByName(name: string) {
  const { locationId } = config();
  const res = await ghl<{ pipelines?: { id: string; stages: { id: string; name: string }[] }[] }>(
    `/opportunities/pipelines?locationId=${locationId}`
  );
  const stage = res.pipelines?.find((p) => p.id === PIPELINE_ID)?.stages.find((s) => s.name === name);
  if (!stage) throw new Error(`Stage "${name}" not found`);
  return stage.id;
}

/** Everything about one lead that the report snapshot doesn't carry, read live. */
export async function getDealDetail(contactId: string): Promise<Result<DealDetail>> {
  return run(async () => {
    assertId(contactId);
    const [c, notes, tasks] = await Promise.all([
      ghl<{ contact?: Record<string, unknown> }>(`/contacts/${contactId}`),
      ghl<{ notes?: { id: string; body?: string; dateAdded: string }[] }>(`/contacts/${contactId}/notes`).catch(() => ({ notes: [] })),
      ghl<{ tasks?: { id: string; title?: string; dueDate?: string; completed?: boolean }[] }>(`/contacts/${contactId}/tasks`).catch(() => ({ tasks: [] })),
    ]);
    const contact = c.contact ?? {};
    const str = (k: string) => (typeof contact[k] === "string" && contact[k] ? (contact[k] as string) : null);
    return {
      phone: str("phone"),
      email: str("email"),
      city: [str("city"), str("state")].filter(Boolean).join(", ") || null,
      website: str("website"),
      tags: Array.isArray(contact.tags) ? (contact.tags as string[]) : [],
      dateAdded: str("dateAdded"),
      notes: (notes.notes ?? [])
        .map((n) => ({ id: n.id, body: (n.body ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim(), at: n.dateAdded }))
        .sort((a, b) => (a.at < b.at ? 1 : -1)),
      tasks: (tasks.tasks ?? [])
        .map((t) => ({ id: t.id, title: t.title ?? "Task", due: t.dueDate ?? null, done: !!t.completed }))
        .sort((a, b) => Number(a.done) - Number(b.done) || String(a.due).localeCompare(String(b.due))),
    };
  });
}

/** Move a deal to another stage (runs that stage's GHL workflows). */
export async function moveDealStage(opportunityId: string, stageId: string): Promise<Result> {
  return run(async () => {
    assertId(opportunityId, stageId);
    await ghl(`/opportunities/${opportunityId}`, { method: "PUT", body: { pipelineId: PIPELINE_ID, pipelineStageId: stageId } });
    invalidateReportCache();
    return null;
  });
}

/**
 * The team's handoff: give the deal to SillettiX Deals, then move it to
 * Financials Received. In that order the GHL guard accepts it and logs the
 * credited rep's $15 (a rep-owned deal dropped there is bounced back).
 */
export async function acceptFinancials(opportunityId: string): Promise<Result> {
  return run(async () => {
    assertId(opportunityId);
    const { locationId } = config();
    const users = await ghl<{ users?: { id: string; email?: string; roles?: { role?: string } }[] }>(`/users/?locationId=${locationId}`);
    const team =
      users.users?.find((u) => u.email?.toLowerCase() === TEAM_EMAIL) ?? users.users?.find((u) => u.roles?.role === "admin");
    if (!team) throw new Error("Couldn't find the SillettiX Deals user");
    await ghl(`/opportunities/${opportunityId}`, { method: "PUT", body: { assignedTo: team.id } });
    const stageId = await stageIdByName("Financials Received");
    await ghl(`/opportunities/${opportunityId}`, { method: "PUT", body: { pipelineId: PIPELINE_ID, pipelineStageId: stageId } });
    invalidateReportCache();
    return null;
  });
}

/** Add a note to the lead in GHL. */
export async function addDealNote(contactId: string, body: string): Promise<Result<{ id: string; body: string; at: string }>> {
  return run(async () => {
    assertId(contactId);
    const text = body.trim().slice(0, 5000);
    if (!text) throw new Error("The note is empty");
    const res = await ghl<{ note?: { id: string; body?: string; dateAdded?: string } }>(`/contacts/${contactId}/notes`, {
      method: "POST",
      body: { body: text },
    });
    return { id: res.note?.id ?? `${Date.now()}`, body: text, at: res.note?.dateAdded ?? new Date().toISOString() };
  });
}
