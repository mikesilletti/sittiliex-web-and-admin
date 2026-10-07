import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/sections/Contact";
import { getSectionContent, sectionPageMetadata } from "@/lib/sections";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return sectionPageMetadata("contact");
}

export default async function ContactPage() {
  const content = await getSectionContent("contact");
  if (!content) notFound();
  return (
    <main className="pt-16">
      <Contact content={content} />
    </main>
  );
}
