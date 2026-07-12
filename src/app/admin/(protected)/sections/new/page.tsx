import Link from "next/link";
import { sectionLabels } from "@/lib/section-registry";
import { createSection } from "@/lib/admin/section-actions";
import type { SectionType } from "@/types/content";

const sectionTypes = Object.keys(sectionLabels) as SectionType[];

export default function NewSectionPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/admin/sections" className="text-xs text-foreground-muted hover:text-foreground">
        ← Sections
      </Link>
      <h1 className="mt-2 text-display-sm font-heading text-foreground">Add a Section</h1>
      <p className="mt-1 text-body-sm text-foreground-muted">
        Choose a section type. You&apos;ll fill in the content next.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sectionTypes.map((type) => (
          <form key={type} action={createSection.bind(null, type)}>
            <button
              type="submit"
              className="focus-ring w-full rounded-md border border-border bg-background-raised px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-accent/40"
            >
              {sectionLabels[type]}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
