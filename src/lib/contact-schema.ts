import { z } from "zod";

// The public inquiry form has three paths. "sell" mirrors the Facebook
// "SillettiX Seller Form v2" question-for-question, and its option values are
// the exact strings Facebook exports, so website and Facebook leads land in
// GoHighLevel with identical field values.

export const INQUIRY_TYPES = ["sell", "partner", "other"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  sell: "Sell My Business",
  partner: "Partner With Us",
  other: "Something Else",
};

export interface Option {
  value: string;
  label: string;
}

const MONEY_RANGES: Option[] = [
  { value: "under_$250,000", label: "Under $250K" },
  { value: "$250,000–$500,000", label: "$250K – $500K" },
  { value: "$500,000–$1_million", label: "$500K – $1M" },
  { value: "$1_million–$2_million", label: "$1M – $2M" },
  { value: "$2_million–$5_million", label: "$2M – $5M" },
  { value: "$5_million+", label: "$5M+" },
];

export const REVENUE_OPTIONS = MONEY_RANGES;
export const PROFIT_OPTIONS = MONEY_RANGES;

export const TIMING_OPTIONS: Option[] = [
  { value: "as_soon_as_possible", label: "As soon as possible" },
  { value: "within_3_months", label: "Within 3 months" },
  { value: "3–6_months", label: "3–6 months" },
  { value: "6–12_months", label: "6–12 months" },
  { value: "more_than_12_months", label: "More than 12 months" },
  { value: "just_exploring", label: "Just exploring" },
];

export const PARTNER_TYPE_OPTIONS: Option[] = [
  { value: "operator", label: "Operator / CEO — I want to run a company" },
  { value: "investor", label: "Investor / capital partner" },
  { value: "broker", label: "Business broker / M&A advisor" },
  { value: "referral", label: "Referral partner" },
  { value: "other", label: "Something else" },
];

/** Question labels, shared by the form and the admin inbox. */
export const DETAIL_LABELS: Record<string, string> = {
  revenue: "Approximately how much revenue does the business generate?",
  profit: "Approximately how much annual profit does the business generate after all expenses?",
  timing: "When would you consider selling?",
  industry: "What industry is your business in?",
  location: "Where is the business located?",
  askingPrice: "What price would you ideally like to receive for the business?",
  partnerType: "What best describes you?",
  linkedin: "LinkedIn or website",
};

const ALL_OPTIONS: Record<string, Option[]> = {
  revenue: REVENUE_OPTIONS,
  profit: PROFIT_OPTIONS,
  timing: TIMING_OPTIONS,
  partnerType: PARTNER_TYPE_OPTIONS,
};

/** Human label for a stored option value (falls back to the raw value). */
export function detailValueLabel(key: string, value: string): string {
  return ALL_OPTIONS[key]?.find((o) => o.value === value)?.label ?? value;
}

const oneOf = (options: Option[], message: string) =>
  z
    .string()
    .refine((v) => options.some((o) => o.value === v), message);

const text = (max: number) => z.string().trim().max(max, "Too long");
const required = (message: string, max = 200) => z.string().trim().min(1, message).max(max, "Too long");

const base = {
  name: required("Please enter your name"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .email("Enter a valid email address")
    .max(320, "Email is too long"),
  smsConsent: z.boolean().default(false),
  /** Honeypot — real visitors never see or fill this. */
  website: z.string().max(0).optional(),
};

const phoneRequired = z
  .string()
  .trim()
  .min(1, "Please enter your phone number")
  .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid phone number")
  .refine((v) => v.replace(/\D/g, "").length <= 15, "Enter a valid phone number");
const phoneOptional = z
  .string()
  .trim()
  .refine((v) => v === "" || (v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 15), "Enter a valid phone number")
  .default("");

export const sellSchema = z.object({
  type: z.literal("sell"),
  ...base,
  phone: phoneRequired,
  company: required("Please enter your company name"),
  industry: required("Please tell us your industry"),
  location: required("Please enter the business location"),
  revenue: oneOf(REVENUE_OPTIONS, "Please choose a revenue range"),
  profit: oneOf(PROFIT_OPTIONS, "Please choose a profit range"),
  timing: oneOf(TIMING_OPTIONS, "Please choose a timeframe"),
  askingPrice: required("Please enter your ideal sale price"),
  message: text(5000).default(""),
});

export const partnerSchema = z.object({
  type: z.literal("partner"),
  ...base,
  phone: phoneOptional,
  company: text(200).default(""),
  partnerType: oneOf(PARTNER_TYPE_OPTIONS, "Please choose what best describes you"),
  linkedin: text(500).default(""),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(5000, "Message is too long (5000 characters max)"),
});

export const otherSchema = z.object({
  type: z.literal("other"),
  ...base,
  phone: phoneOptional,
  company: text(200).default(""),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(5000, "Message is too long (5000 characters max)"),
});

export const inquirySchema = z.discriminatedUnion("type", [sellSchema, partnerSchema, otherSchema]);

export type InquiryValues = z.infer<typeof inquirySchema>;
export type SellValues = z.infer<typeof sellSchema>;
export type PartnerValues = z.infer<typeof partnerSchema>;

/** The path-specific answers stored in contact_submissions.details. */
export function inquiryDetails(values: InquiryValues): Record<string, string> {
  switch (values.type) {
    case "sell":
      return {
        industry: values.industry,
        location: values.location,
        revenue: values.revenue,
        profit: values.profit,
        timing: values.timing,
        askingPrice: values.askingPrice,
      };
    case "partner":
      return { partnerType: values.partnerType, ...(values.linkedin ? { linkedin: values.linkedin } : {}) };
    default:
      return {};
  }
}
