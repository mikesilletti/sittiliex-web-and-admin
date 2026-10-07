import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecentAcquisitions } from "@/components/sections/RecentAcquisitions";
import { getSectionContent } from "@/lib/sections";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Acquisitions & Portfolio | SillettiX",
  description:
    "The companies SillettiX has founded and acquired, and what it looks like when your business becomes the next chapter.",
  alternates: { canonical: "/acquisitions" },
};

export default async function AcquisitionsPage() {
  const content = await getSectionContent("recent-acquisitions");
  if (!content) notFound();
  return (
    <main className="pt-16">
      <RecentAcquisitions content={content} />
    </main>
  );
}
