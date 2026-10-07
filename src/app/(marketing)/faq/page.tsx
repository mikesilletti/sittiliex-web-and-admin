import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FAQ } from "@/components/sections/FAQ";
import { getSectionContent } from "@/lib/sections";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "FAQ | Selling Your Business to SillettiX",
  description:
    "Answers to the questions owners ask most about selling to SillettiX: process, timing, confidentiality, your team and what happens after the sale.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const content = await getSectionContent("faq");
  if (!content) notFound();
  return (
    <main className="pt-16">
      <FAQ content={content} />
    </main>
  );
}
