import Link from "next/link";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { sectionLabels } from "@/lib/section-registry";
import { BarChart, type BarDatum } from "@/components/admin/BarChart";
import { StatTile } from "@/components/admin/StatTile";
import type { SectionType } from "@/types/content";

const cards = [
  { href: "/admin/sections", title: "Sections", description: "Reorder, hide, edit, or add homepage sections." },
  { href: "/admin/contacts", title: "Contacts", description: "Read and download contact form submissions." },
  { href: "/admin/theme", title: "Theme", description: "Colors and font pairing for the whole site." },
  { href: "/admin/settings", title: "Settings", description: "Navigation, footer, contact email, SEO defaults." },
  { href: "/admin/seo", title: "SEO Score", description: "See how the homepage scores and what to fix." },
];

const DAYS = 14;
const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function utcDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function lastNDayBuckets(n: number) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getTime() - (n - 1 - i) * 86_400_000);
    return { key: utcDayKey(d), label: String(d.getUTCDate()), fullLabel: dayFormat.format(d) };
  });
}

function bucketByDay(timestamps: string[], buckets: ReturnType<typeof lastNDayBuckets>): BarDatum[] {
  const counts = new Map(buckets.map((b) => [b.key, 0]));
  for (const ts of timestamps) {
    const key = ts.slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return buckets.map((b) => ({ label: b.label, fullLabel: b.fullLabel, value: counts.get(b.key) ?? 0 }));
}

const reasonVerbs = { edit: "edited", delete: "deleted", restore: "restored" } as const;

export default async function AdminDashboardPage() {
  const supabase = getAdminSupabaseClient();
  const since = new Date(Date.now() - (DAYS - 1) * 86_400_000);
  since.setUTCHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  const [sectionsRes, contactsRes, sectionVersionsRes, settingsVersionsRes, mediaRes] =
    await Promise.all([
      supabase.from("sections").select("id, is_visible"),
      supabase
        .from("contact_submissions")
        .select("created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("section_versions")
        .select("type, reason, created_at")
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("settings_versions")
        .select("scope, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.storage.from("site-media").list("", { limit: 100 }),
    ]);

  const firstError =
    sectionsRes.error ?? contactsRes.error ?? sectionVersionsRes.error ?? settingsVersionsRes.error ?? mediaRes.error;
  if (firstError) throw new Error(`Failed to load dashboard data: ${firstError.message}`);

  const sections = sectionsRes.data ?? [];
  const contacts = contactsRes.data ?? [];
  const sectionVersions = (sectionVersionsRes.data ?? []) as {
    type: SectionType;
    reason: keyof typeof reasonVerbs;
    created_at: string;
  }[];
  const settingsVersions = (settingsVersionsRes.data ?? []) as {
    scope: "theme" | "settings";
    created_at: string;
  }[];
  const mediaCount = (mediaRes.data ?? []).filter((f) => f.name && !f.name.startsWith(".")).length;

  const buckets = lastNDayBuckets(DAYS);
  const submissionsChart = bucketByDay(
    contacts.map((c) => c.created_at),
    buckets
  );
  const editsChart = bucketByDay(
    [...sectionVersions, ...settingsVersions].filter((v) => v.created_at >= sinceIso).map((v) => v.created_at),
    buckets
  );

  const weekAgoIso = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const contactsThisWeek = contacts.filter((c) => c.created_at >= weekAgoIso).length;
  const visibleSections = sections.filter((s) => s.is_visible).length;

  const activity = [
    ...sectionVersions.map((v) => ({
      at: v.created_at,
      text: `${sectionLabels[v.type] ?? v.type} section ${reasonVerbs[v.reason] ?? "changed"}`,
    })),
    ...settingsVersions.map((v) => ({
      at: v.created_at,
      text: v.scope === "theme" ? "Theme saved" : "Settings saved",
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">SillettiX Admin</h1>
      <p className="mt-2 text-body-md text-foreground-muted">Manage the homepage without touching code.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Contact submissions"
          value={contacts.length}
          detail={`${contactsThisWeek} in the last 7 days`}
        />
        <StatTile
          label="Sections"
          value={sections.length}
          detail={`${visibleSections} visible, ${sections.length - visibleSections} hidden`}
        />
        <StatTile label="Edits saved" value={sectionVersions.length + settingsVersions.length} detail="restorable from history" />
        <StatTile label="Media files" value={mediaCount} detail="in the uploads library" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BarChart title={`Contact submissions — last ${DAYS} days`} unit="submissions" data={submissionsChart} />
        <BarChart title={`Content edits — last ${DAYS} days`} unit="edits" data={editsChart} />
      </div>

      {activity.length > 0 && (
        <div className="mt-4 rounded-md border border-border bg-background-raised p-4">
          <p className="text-xs font-medium text-foreground">Recent activity</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {activity.map((a, i) => (
              <li key={`${a.at}-${i}`} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-foreground-muted">{a.text}</span>
                <span className="shrink-0 text-[11px] text-foreground-subtle">
                  {timeFormat.format(new Date(a.at))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="focus-ring rounded-md border border-border bg-background-raised p-5 transition-colors hover:border-accent/40"
          >
            <p className="text-sm font-medium text-foreground">{card.title}</p>
            <p className="mt-1 text-xs text-foreground-muted">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
