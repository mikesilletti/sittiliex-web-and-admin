// One-time migration: transcribes the current static site.ts content + globals.css
// theme values into Supabase. Idempotent — aborts if data already exists unless
// run with --force. Never run in CI/build.
//
// Usage: node --env-file=.env.local scripts/seed-cms.mjs [--force]
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FORCE = process.argv.includes("--force");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  console.error("Run as: node --env-file=.env.local scripts/seed-cms.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Transcribed 1:1 from src/app/globals.css's @theme block + src/app/layout.tsx metadata ──
const siteSettings = {
  id: 1,
  color_background: "#07090c",
  color_background_raised: "#0d1117",
  color_background_overlay: "#11151b",
  color_foreground: "#f4f6f8",
  color_foreground_muted: "#9aa4b2",
  color_foreground_subtle: "#5c6675",
  color_accent: "#1ab4ff",
  color_accent_hover: "#3fc2ff",
  color_border: "#1e2530",
  color_border_strong: "#2a3340",
  font_pairing_id: "space-grotesk-inter",
  seo_site_title: "SillettiX — Acquiring Businesses Built to Last",
  seo_meta_description:
    "SillettiX is a permanent-capital holding company acquiring profitable, founder-led businesses and operating them for decades — not private equity, not a broker.",
  seo_og_image_url: null,
  site_name: "SillettiX",
  contact_email: "mike@sillettix.com",
  contact_phone: "551-305-4030",
  nav_items: [
    { label: "Why SillettiX", href: "#why-us" },
    { label: "Industries", href: "#industries" },
    { label: "Process", href: "#process" },
    { label: "Acquisitions", href: "#acquisitions" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  header_cta_label: "Start a Confidential Conversation",
  header_cta_href: "#contact",
  footer_tagline: "Acquire. Build. Operate. Grow.",
  footer_copyright: `© ${new Date().getFullYear()} SillettiX. All rights reserved.`,
};

// ── Transcribed 1:1 from src/content/site.ts, in page.tsx's current render order ──
const sections = [
  {
    type: "hero",
    sort_order: 0,
    is_visible: true,
    content: {
      eyebrow: "SillettiX — A Permanent Capital Holding Company",
      headlineLines: [
        { text: "We Acquire Great Businesses.", accent: false },
        { text: "And Build Them to Last.", accent: true },
      ],
      subhead:
        "Not private equity. Not a broker. We're operators who buy profitable, founder-led companies and run them for decades — preserving what works, investing in what's next.",
      primaryCta: { label: "Start a Confidential Conversation", href: "#contact" },
      secondaryCta: { label: "Our Process", href: "#process" },
      backgroundImage: "/images/hero-skyline.jpg",
      backgroundImageAlt: "",
    },
  },
  {
    type: "trust-strip",
    sort_order: 1,
    is_visible: true,
    content: {
      badges: [
        { id: "confidential", label: "100% Confidential" },
        { id: "seller-financing", label: "Seller Financing Welcome" },
        { id: "fast-process", label: "Fast, Simple Process" },
        { id: "no-bureaucracy", label: "No Corporate Bureaucracy" },
      ],
      marqueeItems: [
        "Permanent ownership mindset",
        "Fast decision-making",
        "Confidential process",
        "Flexible deal structures",
        "Seller financing welcomed",
        "Management teams stay in place",
        "No unnecessary corporate bureaucracy",
        "Respect for your legacy",
      ],
    },
  },
  {
    type: "why-sell-to-us",
    sort_order: 2,
    is_visible: true,
    content: {
      eyebrow: "Why Sell to SillettiX",
      heading: "The Right Home For Your Business.",
      intro:
        "Selling your business is about more than the highest number. It's about finding someone who will protect your employees, serve your customers, preserve your reputation, and continue what you've spent years building. That's exactly what we do.",
      image: "/images/why-us-office.jpg",
      imageAlt: "Modern office interior",
      points: [
        {
          id: "long-term",
          title: "Permanent Ownership",
          description:
            "We acquire businesses because we believe in building lasting companies — not dismantling them. Our focus is long-term ownership, operational excellence, and sustainable growth.",
        },
        {
          id: "operators",
          title: "Operators, Not Absentee Investors",
          description:
            "When we buy a company, we become operators. We invest in what's working and stay close to the business — not a distant fund managing a spreadsheet.",
        },
        {
          id: "bigger-network",
          title: "Part of Something Bigger",
          description:
            "We're building a diversified family of exceptional companies. Every acquisition benefits from shared technology, operational support, recruiting, marketing, and finance — making each company stronger than it could be alone.",
        },
        {
          id: "flexible",
          title: "A Transition on Your Terms",
          description:
            "Some owners retire immediately. Others stay involved for years. Many just want to reduce stress while their company keeps growing. We build the structure around your goals, not ours.",
        },
      ],
    },
  },
  {
    type: "our-promise",
    sort_order: 3,
    is_visible: true,
    content: {
      eyebrow: "Our Promise",
      heading: "Great Businesses Deserve Great Long-Term Owners.",
      body: "We understand that your business represents years — often decades — of sacrifice. We'll treat your employees with respect. We'll protect your customers. We'll honor your reputation. And we'll continue building what you've created.",
    },
  },
  {
    type: "industries-grid",
    sort_order: 4,
    is_visible: true,
    content: {
      eyebrow: "Industries We Acquire",
      heading: "Businesses We Like.",
      industries: [
        "Home Service Companies",
        "Commercial Services",
        "Residential Services",
        "Facility Maintenance",
        "Restoration Companies",
        "HVAC",
        "Plumbing",
        "Electrical",
        "Landscaping",
        "Cleaning Companies",
        "Pest Control",
        "Manufacturing",
        "Logistics",
        "B2B Service Companies",
        "Software & SaaS",
        "Digital Businesses",
        "Professional Services",
      ],
      featuredIndustries: [
        { id: "manufacturing", name: "Manufacturing", image: "/images/industry-manufacturing.jpg", alt: "" },
        { id: "logistics", name: "Logistics", image: "/images/industry-logistics.jpg", alt: "" },
        { id: "b2b-services", name: "B2B Services", image: "/images/industry-warehouse.jpg", alt: "" },
        { id: "software", name: "Software & SaaS", image: "/images/industry-tech.jpg", alt: "" },
        { id: "facility", name: "Facility & Construction", image: "/images/industry-construction.jpg", alt: "" },
        { id: "trades", name: "Skilled Trades", image: "/images/industry-trades.jpg", alt: "" },
      ],
      whatWeLookForHeading: "What We Look For",
      whatWeLookFor: [
        "Established business with a proven track record",
        "Consistent profitability",
        "Strong customer relationships",
        "Reliable management team",
        "Opportunities for continued growth",
        "Owners seeking a responsible long-term buyer",
      ],
    },
  },
  {
    type: "acquisition-process",
    sort_order: 5,
    is_visible: true,
    content: {
      eyebrow: "Our Acquisition Process",
      heading: "We Move Fast.",
      body: "Selling a business shouldn't take 12 months. Our acquisition process is designed to be straightforward.",
      image: "/images/process-meeting.jpg",
      imageAlt: "Reviewing acquisition details",
      steps: [
        { id: "conversation", index: 1, title: "Initial Conversation", description: "A confidential introductory call to understand your business." },
        { id: "review", index: 2, title: "Review", description: "We review financials, operations, and growth opportunities." },
        { id: "loi", index: 3, title: "Letter of Intent", description: "If it's a fit, we'll present a fair offer." },
        { id: "diligence", index: 4, title: "Due Diligence", description: "Simple, transparent, and efficient." },
        { id: "closing", index: 5, title: "Closing", description: "A smooth transition with minimal disruption." },
      ],
    },
  },
  {
    type: "recent-acquisitions",
    sort_order: 6,
    is_visible: true,
    content: {
      eyebrow: "Our Portfolio",
      heading: "We're Just Getting Started.",
      body: "SillettiX is a new holding company — our first acquisition is still ahead of us. We're building a portfolio of exceptional, founder-led businesses for the long term. If you'd like to be part of that story, let's start the conversation.",
      cta: { label: "Start the Conversation", href: "#contact" },
      placeholderImages: [
        "/images/acquisition-handshake.jpg",
        "/images/acquisition-contract.jpg",
        "/images/acquisition-office.jpg",
      ],
    },
  },
  {
    type: "faq",
    sort_order: 7,
    is_visible: true,
    content: {
      eyebrow: "FAQ",
      heading: "Common Questions.",
      items: [
        {
          id: "vs-pe",
          question: "How is this different from private equity?",
          answer:
            "Most private equity firms buy, restructure, and sell within 3–7 years. We don't. When we acquire your business, we're still operating it a decade from now — there's no fund cycle forcing an exit.",
        },
        {
          id: "employees",
          question: "Will you keep my employees and management team?",
          answer:
            "Yes. Your team is one of the reasons your business succeeds. In almost every acquisition, your management team and employees stay in place.",
        },
        {
          id: "confidential",
          question: "Is this process confidential?",
          answer: "Completely. From the first call through closing, every conversation is strictly confidential.",
        },
        {
          id: "timeline",
          question: "How long does the process take?",
          answer:
            "We move fast — a typical acquisition can close in weeks, not the 12+ months common with traditional business sales.",
        },
        {
          id: "stay-involved",
          question: "Do I have to stay involved after selling?",
          answer:
            "Not unless you want to. Some owners retire immediately, others stay on for a few years. We'll build a structure around your goals.",
        },
        {
          id: "not-ready",
          question: "I'm not ready to sell yet — can we still talk?",
          answer: "Absolutely. Many of our best conversations start years before a deal happens. No pressure, no obligation.",
        },
      ],
    },
  },
  {
    type: "contact",
    sort_order: 8,
    is_visible: true,
    content: {
      eyebrow: "Let's Start the Conversation",
      heading: "Ready to Talk About Your Next Chapter?",
      body: "If you've been thinking about selling your business — whether next month or five years from now — we'd love to connect. Every conversation is completely confidential, with no pressure and no obligation.",
      email: "mike@sillettix.com",
      phone: "551-305-4030",
      backgroundImage: "/images/contact-office.jpg",
    },
  },
];

async function main() {
  const { data: existingSettings } = await supabase.from("site_settings").select("id").limit(1);
  const { data: existingSections } = await supabase.from("sections").select("id").limit(1);

  if (!FORCE && ((existingSettings && existingSettings.length > 0) || (existingSections && existingSections.length > 0))) {
    console.error("Data already exists in site_settings and/or sections. Re-run with --force to overwrite.");
    process.exit(1);
  }

  if (FORCE) {
    console.log("Clearing existing data (--force)...");
    await supabase.from("sections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("site_settings").delete().eq("id", 1);
  }

  console.log("Inserting site_settings...");
  const { error: settingsError } = await supabase.from("site_settings").insert(siteSettings);
  if (settingsError) {
    console.error("Failed to insert site_settings:", settingsError.message);
    process.exit(1);
  }

  console.log(`Inserting ${sections.length} sections...`);
  const { error: sectionsError } = await supabase.from("sections").insert(sections);
  if (sectionsError) {
    console.error("Failed to insert sections:", sectionsError.message);
    process.exit(1);
  }

  console.log("Seed complete.");
}

main();
