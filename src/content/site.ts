import type {
  NavItem,
  HeroContent,
  TrustStripContent,
  WhySellToUsContent,
  OurPromiseContent,
  IndustriesGridContent,
  AcquisitionProcessContent,
  RecentAcquisitionsContent,
  FaqContent,
  ContactContent,
} from "@/types/content";

export const siteName = "SillettiX";

export const nav: NavItem[] = [
  { label: "Why SillettiX", href: "#why-us" },
  { label: "Industries", href: "#industries" },
  { label: "Process", href: "#process" },
  { label: "Acquisitions", href: "#acquisitions" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export const hero: HeroContent = {
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
};

export const trustStrip: TrustStripContent = {
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
};

export const whySellToUs: WhySellToUsContent = {
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
};

export const ourPromise: OurPromiseContent = {
  eyebrow: "Our Promise",
  heading: "Great Businesses Deserve Great Long-Term Owners.",
  body: "We understand that your business represents years — often decades — of sacrifice. We'll treat your employees with respect. We'll protect your customers. We'll honor your reputation. And we'll continue building what you've created.",
};

export const industriesGrid: IndustriesGridContent = {
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
};

export const acquisitionProcess: AcquisitionProcessContent = {
  eyebrow: "Our Acquisition Process",
  heading: "We Move Fast.",
  body: "Selling a business shouldn't take 12 months. Our acquisition process is designed to be straightforward.",
  image: "/images/process-meeting.jpg",
  imageAlt: "Reviewing acquisition details",
  steps: [
    {
      id: "conversation",
      index: 1,
      title: "Initial Conversation",
      description: "A confidential introductory call to understand your business.",
    },
    {
      id: "review",
      index: 2,
      title: "Review",
      description: "We review financials, operations, and growth opportunities.",
    },
    {
      id: "loi",
      index: 3,
      title: "Letter of Intent",
      description: "If it's a fit, we'll present a fair offer.",
    },
    {
      id: "diligence",
      index: 4,
      title: "Due Diligence",
      description: "Simple, transparent, and efficient.",
    },
    {
      id: "closing",
      index: 5,
      title: "Closing",
      description: "A smooth transition with minimal disruption.",
    },
  ],
};

export const recentAcquisitions: RecentAcquisitionsContent = {
  eyebrow: "Our Portfolio",
  heading: "We're Just Getting Started.",
  body: "SillettiX is a new holding company — our first acquisition is still ahead of us. We're building a portfolio of exceptional, founder-led businesses for the long term. If you'd like to be part of that story, let's start the conversation.",
  cta: { label: "Start the Conversation", href: "#contact" },
  placeholderImages: [
    "/images/acquisition-handshake.jpg",
    "/images/acquisition-contract.jpg",
    "/images/acquisition-office.jpg",
  ],
};

export const faq: FaqContent = {
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
      answer:
        "Completely. From the first call through closing, every conversation is strictly confidential.",
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
      answer:
        "Absolutely. Many of our best conversations start years before a deal happens. No pressure, no obligation.",
    },
  ],
};

export const contact: ContactContent = {
  eyebrow: "Let's Start the Conversation",
  heading: "Ready to Talk About Your Next Chapter?",
  body: "If you've been thinking about selling your business — whether next month or five years from now — we'd love to connect. Every conversation is completely confidential, with no pressure and no obligation.",
  email: "Deals@sillettix.com",
  backgroundImage: "/images/contact-office.jpg",
};

export const footer = {
  tagline: "Acquire. Build. Operate. Grow.",
  copyright: `© ${new Date().getFullYear()} SillettiX. All rights reserved.`,
};
