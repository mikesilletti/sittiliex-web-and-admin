import "server-only";
import { DETAIL_LABELS, INQUIRY_TYPE_LABELS, detailValueLabel, type InquiryValues } from "@/lib/contact-schema";

// Sends website inquiries into GoHighLevel (API v2, Private Integration token).
// Field IDs are the SillettiX location's existing contact custom fields — the
// same ones the Facebook "Seller Form v2" leads fill — so website and Facebook
// leads look identical in GHL.

const API = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

const FIELD_IDS = {
  industry: "G5KaNJyvGdncHyiTHplt", // Industry
  businessName: "Gm5Vnq6BwbYqnwUFxq0K", // Business Name
  location: "uBJF8aclX23O7nJyfazh", // Business Location
  revenue: "NdRT69iiTD62oBATEUg6", // Annual Revenue
  profit: "sYDlwDtCWs2S8PxfkIAl", // Annual Profit
  timing: "FJ4N0gAzHSYLYU76BTtA", // Timeline to Sell
  askingPrice: "l8Jvrz6GOtP9ZQ8mQAwI", // Asking Price
} as const;

/** Seller leads open a deal here. */
const SELL_PIPELINE = {
  pipelineId: "Y1NDUrBSK8LfLGJLiHAv", // SillettiX Acquisition Pipeline
  stageId: "95918158-9a30-4686-b403-b7bec2c20219", // New Lead
};

const SOURCE = "sillettix.com website";

export interface GhlSyncResult {
  contactId: string | null;
  error: string | null;
}

function config() {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  return token && locationId ? { token, locationId } : null;
}

async function ghl<T>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: VERSION,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GHL ${method} ${path.split("?")[0]} → ${res.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

/** GHL matches/dedupes on E.164; assume US for bare 10-digit numbers. */
function toE164(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

function splitName(full: string) {
  const [first, ...rest] = full.trim().split(/\s+/);
  return { firstName: first ?? "", lastName: rest.join(" ") };
}

function noteBody(values: InquiryValues): string | null {
  const lines = [`Website inquiry — ${INQUIRY_TYPE_LABELS[values.type]}`];
  if (values.type === "partner") {
    lines.push(`${DETAIL_LABELS.partnerType}: ${detailValueLabel("partnerType", values.partnerType)}`);
    if (values.linkedin) lines.push(`${DETAIL_LABELS.linkedin}: ${values.linkedin}`);
  }
  if (values.message) lines.push("", values.message);
  lines.push("", `SMS consent: ${values.smsConsent ? "Yes" : "No"}`);
  // Seller answers already live in custom fields; only add a note when there's
  // something beyond them.
  if (values.type === "sell" && !values.message) return null;
  return lines.join("\n");
}

export async function syncInquiryToGhl(values: InquiryValues): Promise<GhlSyncResult> {
  const cfg = config();
  if (!cfg) return { contactId: null, error: "GHL not configured" };
  const { token, locationId } = cfg;

  const customFields =
    values.type === "sell"
      ? [
          { id: FIELD_IDS.industry, field_value: values.industry },
          { id: FIELD_IDS.businessName, field_value: values.company },
          { id: FIELD_IDS.location, field_value: values.location },
          { id: FIELD_IDS.revenue, field_value: values.revenue },
          { id: FIELD_IDS.profit, field_value: values.profit },
          { id: FIELD_IDS.timing, field_value: values.timing },
          { id: FIELD_IDS.askingPrice, field_value: values.askingPrice },
        ]
      : [];

  try {
    // Upsert without tags: GHL's upsert overwrites the tag list, which would
    // strip tags from an existing contact. Tags are added separately below.
    const upsert = await ghl<{ contact?: { id: string } }>(token, "POST", "/contacts/upsert", {
      locationId,
      ...splitName(values.name),
      email: values.email,
      ...(values.phone ? { phone: toE164(values.phone) } : {}),
      ...(values.company ? { companyName: values.company } : {}),
      source: SOURCE,
      ...(customFields.length ? { customFields } : {}),
    });
    const contactId = upsert.contact?.id;
    if (!contactId) throw new Error("GHL upsert returned no contact id");

    const problems: string[] = [];
    const tags = [`website-${values.type}`, ...(values.smsConsent ? ["website-sms-opt-in"] : [])];

    await ghl(token, "POST", `/contacts/${contactId}/tags`, { tags }).catch((e: Error) => problems.push(e.message));

    const note = noteBody(values);
    if (note) {
      await ghl(token, "POST", `/contacts/${contactId}/notes`, { body: note }).catch((e: Error) =>
        problems.push(e.message)
      );
    }

    if (values.type === "sell") {
      await ghl(token, "POST", "/opportunities/", {
        locationId,
        pipelineId: SELL_PIPELINE.pipelineId,
        pipelineStageId: SELL_PIPELINE.stageId,
        contactId,
        name: `${values.company} (website)`,
        status: "open",
        source: SOURCE,
      }).catch((e: Error) => problems.push(e.message));
    }

    return { contactId, error: problems.length ? problems.join(" | ") : null };
  } catch (e) {
    return { contactId: null, error: (e as Error).message };
  }
}
