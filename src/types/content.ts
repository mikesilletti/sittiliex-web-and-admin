export interface ProcessStep {
  id: string;
  index: number;
  title: string;
  description: string;
}

export interface TrustBadge {
  id: string;
  label: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface ValuePoint {
  id: string;
  title: string;
  description: string;
}
