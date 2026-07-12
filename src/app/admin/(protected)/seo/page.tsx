import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { scoreSite } from "@/lib/seo/score";
import { cn } from "@/lib/utils";
import type { SectionRow, SiteSettings } from "@/types/content";

function scoreColor(score: number) {
  if (score >= 90) return "text-accent";
  if (score >= 70) return "text-yellow-400";
  return "text-red-400";
}

export default async function AdminSeoPage() {
  const supabase = getAdminSupabaseClient();
  const [{ data: settingsData }, { data: sectionsData }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("sections").select("*").order("sort_order", { ascending: true }),
  ]);

  const settings = settingsData as SiteSettings;
  const sections = (sectionsData ?? []) as SectionRow[];
  const { score, checks } = scoreSite(settings, sections);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">SEO Score</h1>
      <p className="mt-1 text-body-sm text-foreground-muted">
        A heuristic score based on the current homepage content — not a live crawl.
      </p>

      <div className="mt-8 rounded-md border border-border bg-background-raised p-8 text-center">
        <p className={cn("text-6xl font-heading font-semibold", scoreColor(score))}>{score}</p>
        <p className="mt-1 text-sm text-foreground-muted">out of 100</p>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className="flex items-start gap-3 rounded-md border border-border bg-background-raised px-4 py-3"
          >
            <span className={cn("mt-0.5 text-sm", check.passed ? "text-accent" : "text-red-400")}>
              {check.passed ? "✓" : "✕"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{check.label}</p>
              <p className="text-xs text-foreground-muted">{check.detail}</p>
            </div>
            <span className="shrink-0 text-xs text-foreground-subtle">{check.weight} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
