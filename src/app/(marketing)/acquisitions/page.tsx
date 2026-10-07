import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecentAcquisitions } from "@/components/sections/RecentAcquisitions";
import { getSectionContent, sectionPageMetadata } from "@/lib/sections";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return sectionPageMetadata("recent-acquisitions");
}

export default async function AcquisitionsPage() {
  const content = await getSectionContent("recent-acquisitions");
  if (!content) notFound();
  return (
    <main className="pt-16">
      <RecentAcquisitions content={content} />
    </main>
  );
}
