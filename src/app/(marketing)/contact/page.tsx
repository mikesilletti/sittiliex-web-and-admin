import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/sections/Contact";
import { getSectionContent } from "@/lib/sections";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "What's Your Business Worth? | Contact SillettiX",
  description:
    "Start a confidential conversation with SillettiX about selling your business, partnering with us, or anything else.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const content = await getSectionContent("contact");
  if (!content) notFound();
  return (
    <main className="pt-16">
      <Contact content={content} />
    </main>
  );
}
