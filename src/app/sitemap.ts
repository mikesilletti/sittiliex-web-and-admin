import type { MetadataRoute } from "next";

const BASE = "https://sillettix.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: BASE, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/acquisitions`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/faq`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/sms`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
