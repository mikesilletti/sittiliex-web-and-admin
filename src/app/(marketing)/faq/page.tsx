import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FAQ } from "@/components/sections/FAQ";
import { getSectionContent, sectionPageMetadata } from "@/lib/sections";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return sectionPageMetadata("faq");
}

export default async function FaqPage() {
  const content = await getSectionContent("faq");
  if (!content) notFound();
  return (
    <main className="pt-16">
      <FAQ content={content} />
    </main>
  );
}
