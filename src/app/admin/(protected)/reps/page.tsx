import type { Metadata } from "next";
import { getScorecard } from "@/lib/reps/scorecard";
import { RepScorecard } from "@/components/admin/reps/RepScorecard";
import type { Scorecard } from "@/lib/reps/shared";

export const metadata: Metadata = { title: "Rep Scorecard" };

// Always read live from GoHighLevel; the view refreshes itself every minute.
export const dynamic = "force-dynamic";

export default async function AdminRepsPage() {
  let data: Scorecard | null = null;
  let error: string | null = null;
  try {
    data = await getScorecard();
  } catch (e) {
    error = (e as Error).message;
  }

  if (data) return <RepScorecard data={data} />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">Rep Scorecard</h1>
      <div className="mt-8 rounded-md border border-red-400/30 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-300">Couldn&apos;t load the scorecard from GoHighLevel.</p>
        <p className="mt-1 text-xs text-foreground-muted">{error}</p>
        <p className="mt-3 text-xs text-foreground-subtle">
          The website&apos;s GoHighLevel key needs read access to contacts, opportunities and users (Settings →
          Private Integrations in GoHighLevel).
        </p>
      </div>
    </div>
  );
}
