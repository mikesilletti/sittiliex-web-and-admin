import type { AboutPageContent, FounderSpotlightContent } from "@/types/content";

// Starting copy for the About page and the homepage founder spotlight. The
// database row is the source of truth once it exists; these only render if it
// is missing, and seeded the rows when the sections became editable.

export const FOUNDER_SPOTLIGHT_DEFAULTS: FounderSpotlightContent = {
  eyebrow: "Meet the founder",
  heading: "The builder behind SillettiX.",
  body: "Michael Silletti built and scaled Clensy with his own systems and sales playbook. Now he buys good businesses and makes them great.",
  image: "/images/michael-silletti-office-4k.webp",
  imageAlt: "Michael Silletti, founder of SillettiX",
  facts: [
    { id: "built", label: "Built & scaled", value: "Clensy" },
    { id: "runs-on", label: "Runs on", value: "Systems" },
    { id: "goal", label: "The goal", value: "Next level" },
  ],
  linkLabel: "Read Michael's story",
  linkHref: "/about",
};

export const ABOUT_PAGE_DEFAULTS: AboutPageContent = {
  seoTitle: "About Michael Silletti | SillettiX",
  seoDescription:
    "Meet Michael Silletti, the operator who built and scaled Clensy with his own systems and sales playbook. Now he buys good businesses, makes them great and takes them to the next level.",
  heroBadge: "Founder, SillettiX",
  headingLead: "Meet",
  headingAccent: "Michael.",
  heroIntro:
    "The operator who built and rapidly scaled Clensy with his own systems and a sales-and-marketing engine. Now he takes good businesses and makes them great.",
  heroImage: "/images/michael-silletti-hero-4k.webp",
  heroImageAlt: "Michael Silletti, founder of SillettiX",
  heroFacts: [
    { id: "built", label: "Built & scaled", value: "Clensy" },
    { id: "runs-on", label: "Runs on", value: "Systems" },
    { id: "goal", label: "The goal", value: "Next level" },
  ],
  heroCta: { label: "Talk to me directly", href: "/contact" },
  statement:
    "Good businesses become *great* ones when they run on *systems,* *data* and *technology,* not on one person working around the clock.",
  storyImage: "/images/michael-silletti-office-4k.webp",
  storyImageAlt: "Michael Silletti at his desk",
  storyCaption: "The builder behind SillettiX.",
  chapters: [
    {
      id: "builder",
      tag: "The builder",
      title: "He built Clensy. Then he scaled it fast.",
      body: "Michael didn't inherit a playbook. He wrote one. At Clensy he built the systems and procedures from scratch: hiring, training, scheduling, quality control and pricing. Then he used them to scale the company quickly without losing the standard customers counted on.",
    },
    {
      id: "operating-system",
      tag: "The operating system",
      title: "Every number tracked. Every process automated.",
      body: "Michael runs businesses on data. Clear KPIs for every role and every job, dashboards that show exactly what's working, and technology that automates the busywork: follow-ups, scheduling, invoicing and reporting. Paired with his sales and marketing background, it turns a good reputation into predictable growth.",
    },
    {
      id: "acquirer",
      tag: "The acquirer",
      title: "Now he does it for businesses like yours.",
      body: "SillettiX buys good, owner-built businesses and makes them great. It brings the same systems, technology and growth playbook that built Clensy and takes each company to the next level.",
    },
  ],
  playbookEyebrow: "What he brings",
  playbookHeading: "The Michael Silletti playbook.",
  playbookIntro: "The same four things that scaled Clensy, applied to every business SillettiX acquires.",
  playbook: [
    {
      id: "systems",
      title: "Systems & procedures",
      description:
        "Documented playbooks for hiring, training, operations and quality, so the business runs on systems, not on one person.",
    },
    {
      id: "kpis",
      title: "KPIs on everything",
      description:
        "Clear numbers for every role, every job and every customer. Decisions come from data, not guesswork.",
    },
    {
      id: "tech",
      title: "Tech & automation",
      description:
        "Modern software automates follow-ups, scheduling, invoicing and reporting, which frees the team to do great work.",
    },
    {
      id: "scale",
      title: "Built to scale",
      description:
        "Predictable lead flow, more capacity, new services. Growth that compounds because the foundation is built to hold it.",
    },
  ],
  qaEyebrow: "Owner to owner",
  qaHeading: "The questions every owner asks Michael.",
  qaInitials: "MS",
  qa: [
    {
      id: "team",
      question: "What happens to my team?",
      answer: "They stay, and they get better tools, clearer systems and more support. Your people are the business.",
    },
    {
      id: "change",
      question: "What will you actually change?",
      answer:
        "I keep what works and build on it: systems that take pressure off, clear goals for every role, and technology that automates the busywork so your team can focus on customers.",
    },
    {
      id: "talking-to",
      question: "Who will I actually be talking to?",
      answer: "Me. No layers, no games. You'll get straight answers and know where you stand quickly.",
    },
    {
      id: "private-equity",
      question: "Is this private equity in disguise?",
      answer:
        "No. There's no fund behind me pushing to cut costs and resell fast. I'm an operator. I buy good companies to build them up, not to strip them down.",
    },
  ],
  ctaEyebrow: "Your next chapter",
  ctaHeading: "Ready to take your business to the next level?",
  ctaBody:
    "Let's talk about what Michael's playbook could do for what you've built. It's confidential, with no pressure and no obligation.",
  ctaImage: "/images/acquisition-handshake.jpg",
  ctaButton: { label: "What's My Business Worth?", href: "/contact" },
  ctaPhoneLabel: "Call",
};

/** Search title/description for the standalone section pages, used while the admin fields are blank. */
export const PAGE_SEO_DEFAULTS = {
  "recent-acquisitions": {
    path: "/acquisitions",
    title: "Acquisitions & Portfolio | SillettiX",
    description:
      "The companies SillettiX has founded and acquired, and what it looks like when your business becomes the next chapter.",
  },
  faq: {
    path: "/faq",
    title: "FAQ | Selling Your Business to SillettiX",
    description:
      "Answers to the questions owners ask most about selling to SillettiX: process, timing, confidentiality, your team and what happens after the sale.",
  },
  contact: {
    path: "/contact",
    title: "What's Your Business Worth? | Contact SillettiX",
    description:
      "Start a confidential conversation with SillettiX about selling your business, partnering with us, or anything else.",
  },
} as const;

export type SeoPageSectionType = keyof typeof PAGE_SEO_DEFAULTS;
