import type { Metadata } from "next";
import { getReportData } from "@/lib/reps/scorecard";
import type { ReportData } from "@/lib/reps/shared";
import { ReportsApp } from "@/components/admin/reps/ReportsApp";
import { filtersFromQuery } from "@/components/admin/reps/model";

export const metadata: Metadata = { title: "Rep Reports" };

// Always read live from GoHighLevel; the view refreshes itself every minute.
export const dynamic = "force-dynamic";

export default async function AdminRepsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  let data: ReportData | null = null;
  let error: string | null = null;
  try {
    data = await getReportData();
  } catch (e) {
    error = (e as Error).message;
  }

  if (data) {
    const tab = typeof query.tab === "string" ? query.tab : "overview";
    return <ReportsApp data={data} initial={filtersFromQuery(query)} initialTab={tab} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">Rep Reports</h1>
      <div className="mt-8 rounded-md border border-red-400/30 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-300">Couldn&apos;t load the reports from GoHighLevel.</p>
        <p className="mt-1 text-xs text-foreground-muted">{error}</p>
        <p className="mt-3 text-xs text-foreground-subtle">
          The website&apos;s GoHighLevel key needs read access to contacts, opportunities, calendars and users (Settings →
          Private Integrations in GoHighLevel).
        </p>
      </div>
    </div>
  );
}
