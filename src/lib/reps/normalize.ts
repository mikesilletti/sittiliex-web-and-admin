import "server-only";

// Turns the free-text answers leads type into the Facebook / website form
// ("Hackensack New Jersey", "Roanoke vA", "91362", "auto repair and
// collision repair", "$125K") into values the reports can filter and group.

const INDUSTRY_RULES: [string, RegExp][] = [
  ["Home services", /hvac|heat|cool|plumb|roof|landscap|hardscap|paver|lawn|tree|clean|janitor|pest|handyman|restor|flood|mason|paint|electric|contract|construct|remodel|home improve|home maint|snow|plow|firewood|screen|pool|gutter|fence|garage door|carpet|floor|excavat|glass|window/i],
  ["Automotive", /auto|car care|car dealer|used car|collision|body ?shop|autobody|tire|mechanic|detail/i],
  ["Transportation", /tow|truck|taxi|transport|logistic|freight|limo|moving/i],
  ["Food & beverage", /restau?ra?u?nt|restaraunt|pizz|cafe|coffee|food|baker|deli|taqueri|pho|cater|bar\b|brew|meat|produce|soda|candy|liquor|grill|kitchen|torta|halal|kosher/i],
  ["Health & beauty", /salon|beauty|spa\b|fitness|gym|therap|medical|dental|rehab|health|chiro|massage|nail|barber/i],
  ["Retail", /retail|store|shop|boutique|franchise|batter|bridal|aquatic|exotic|jewel|electronic/i],
  ["Manufacturing", /manufactur|fabricat|machin|embroider|print|welding|production/i],
  ["Professional services", /consult|marketing|real ?estate|realtor|insur|account|law|legal|bank|design|communicat|software|agency|staffing|magazine|media|it services/i],
  ["Hospitality & leisure", /hospitality|hotel|motel|laser tag|entertain|event|recreation|travel/i],
];

export function industryGroup(raw: string): string {
  if (!raw || /^(none|n\/?a|-)$/i.test(raw.trim())) return "Not given";
  return INDUSTRY_RULES.find(([, re]) => re.test(raw))?.[0] ?? "Other";
}

const STATE_NAMES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO",
  connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT", virginia: "VA", washington: "WA",
  "west virginia": "WV", wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
  jersey: "NJ",
};
const STATE_CODES = new Set(Object.values(STATE_NAMES));

// First three ZIP digits -> state (USPS prefix ranges).
const ZIP_RANGES: [number, number, string][] = [
  [10, 27, "MA"], [28, 29, "RI"], [30, 38, "NH"], [39, 49, "ME"], [50, 59, "VT"], [60, 69, "CT"],
  [70, 89, "NJ"], [100, 149, "NY"], [150, 196, "PA"], [197, 199, "DE"], [200, 205, "DC"],
  [206, 219, "MD"], [220, 246, "VA"], [247, 268, "WV"], [270, 289, "NC"], [290, 299, "SC"],
  [300, 319, "GA"], [398, 399, "GA"], [320, 349, "FL"], [350, 369, "AL"], [370, 385, "TN"],
  [386, 397, "MS"], [400, 427, "KY"], [430, 459, "OH"], [460, 479, "IN"], [480, 499, "MI"],
  [500, 528, "IA"], [530, 549, "WI"], [550, 567, "MN"], [570, 577, "SD"], [580, 588, "ND"],
  [590, 599, "MT"], [600, 629, "IL"], [630, 658, "MO"], [660, 679, "KS"], [680, 693, "NE"],
  [700, 714, "LA"], [716, 729, "AR"], [730, 749, "OK"], [750, 799, "TX"], [885, 885, "TX"],
  [800, 816, "CO"], [820, 831, "WY"], [832, 838, "ID"], [840, 847, "UT"], [850, 865, "AZ"],
  [870, 884, "NM"], [889, 898, "NV"], [900, 961, "CA"], [967, 968, "HI"], [970, 979, "OR"],
  [980, 994, "WA"], [995, 999, "AK"],
];

// Towns sellers typed on their own, with no state.
const TOWNS: Record<string, string> = {
  "scotch plains": "NJ", parsippany: "NJ", hackensack: "NJ", "jersey city": "NJ", communipaw: "NJ",
  "long island": "NY", brooklyn: "NY", queens: "NY", bronx: "NY", "staten island": "NY", manhattan: "NY",
  dfw: "TX", dallas: "TX", houston: "TX", austin: "TX", hazelton: "PA", hazleton: "PA", philadelphia: "PA",
  "adams friendship": "WI", frederick: "MD", chicago: "IL", atlanta: "GA", miami: "FL", boston: "MA",
};

// Area code -> state, the last resort: a small business's number is almost always local.
const AREA_CODES: Record<string, string> = Object.fromEntries(
  Object.entries({
    AL: "205 251 256 334 659 938", AK: "907", AZ: "480 520 602 623 928", AR: "479 501 870",
    CA: "209 213 279 310 323 341 350 408 415 424 442 510 530 559 562 619 626 628 650 657 661 669 707 714 747 760 805 818 820 831 840 858 909 916 925 949 951",
    CO: "303 719 720 970 983", CT: "203 475 860 959", DE: "302", DC: "202 771",
    FL: "239 305 321 324 352 386 407 448 561 645 656 689 727 728 754 772 786 813 850 863 904 941 954",
    GA: "229 404 470 478 678 706 762 770 912 943", HI: "808", ID: "208 986",
    IL: "217 224 309 312 331 447 464 618 630 708 730 773 779 815 847 861 872", IN: "219 260 317 463 574 765 812 930",
    IA: "319 515 563 641 712", KS: "316 620 785 913", KY: "270 364 502 606 859", LA: "225 318 337 504 985",
    ME: "207", MD: "227 240 301 410 443 667", MA: "339 351 413 508 617 774 781 857 978",
    MI: "231 248 269 313 517 586 616 679 734 810 906 947 989", MN: "218 320 507 612 651 763 952",
    MS: "228 601 662 769", MO: "314 417 557 573 636 660 816 975", MT: "406", NE: "308 402 531",
    NV: "702 725 775", NH: "603", NJ: "201 551 609 640 732 848 856 862 908 973", NM: "505 575",
    NY: "212 315 329 332 347 363 516 518 585 607 624 631 646 680 716 718 838 845 914 917 929 934",
    NC: "252 336 472 704 743 828 910 919 980 984", ND: "701",
    OH: "216 220 234 283 326 330 380 419 436 440 513 567 614 740 937", OK: "405 539 572 580 918",
    OR: "458 503 541 971", PA: "215 223 267 272 412 445 484 570 582 610 717 724 814 835 878", RI: "401",
    SC: "803 821 839 843 854 864", SD: "605", TN: "423 615 629 731 865 901 931",
    TX: "210 214 254 281 325 346 361 409 430 432 469 512 682 713 726 737 806 817 830 832 903 915 936 940 945 956 972 979",
    UT: "385 435 801", VT: "802", VA: "276 434 540 571 686 703 757 804 826 948",
    WA: "206 253 360 425 509 564", WV: "304 681", WI: "262 274 353 414 534 608 715 920", WY: "307",
  }).flatMap(([state, codes]) => codes.split(" ").map((c) => [c, state]))
);

export function stateOf(raw: string, contactState?: string | null, phone?: string | null): string {
  const fromText = stateFromText(raw, contactState);
  if (fromText !== "Unknown") return fromText;
  const digits = (phone ?? "").replace(/\D/g, "");
  const area = digits.length === 11 && digits.startsWith("1") ? digits.slice(1, 4) : digits.length === 10 ? digits.slice(0, 3) : "";
  return AREA_CODES[area] ?? "Unknown";
}

function stateFromText(raw: string, contactState?: string | null): string {
  const direct = (contactState ?? "").trim().toUpperCase();
  if (STATE_CODES.has(direct)) return direct;
  const text = (raw ?? "").toLowerCase().replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "Unknown";
  const zip = text.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zip) {
    const p = Number(zip[1].slice(0, 3));
    const hit = ZIP_RANGES.find(([a, b]) => p >= a && p <= b);
    if (hit) return hit[2];
  }
  // longest names first so "west virginia" wins over "virginia"
  for (const name of Object.keys(STATE_NAMES).sort((a, b) => b.length - a.length)) {
    if (new RegExp(`\\b${name}\\b`).test(text)) return STATE_NAMES[name];
  }
  const words = text.split(" ");
  for (const w of [words[words.length - 1], ...words]) {
    if (w.length === 2 && STATE_CODES.has(w.toUpperCase())) return w.toUpperCase();
  }
  const town = Object.keys(TOWNS).find((t) => text.includes(t));
  return town ? TOWNS[town] : "Unknown";
}

export function askingValue(raw: string): number | null {
  const t = (raw ?? "").toLowerCase().replace(/,/g, "").trim();
  const m = t.match(/(\d+(?:\.\d+)?)\s*(k|m|mm|million|thousand)?/);
  if (!m) return null;
  let n = Number(m[1]);
  const unit = m[2];
  if (unit === "k" || unit === "thousand") n *= 1_000;
  else if (unit === "m" || unit === "mm" || unit === "million") n *= 1_000_000;
  else if (/^\d{1,3}\.\d{3}$/.test(m[1])) n = Number(m[1].replace(".", "")) * 1; // "500.000" = 500,000
  if (!unit && n > 0 && n < 1000) n *= 1_000; // "250" almost always means $250k
  return n > 0 ? n : null;
}

export function askingBand(v: number | null): string {
  if (v === null) return "Not given";
  if (v < 250_000) return "Under $250k";
  if (v < 500_000) return "$250k - $500k";
  if (v < 1_000_000) return "$500k - $1M";
  if (v < 5_000_000) return "$1M - $5M";
  return "$5M+";
}

export function formBand(raw: unknown, allowed: string[]): string {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v || /^(none|n\/?a)$/i.test(v)) return "Not given";
  return allowed.find((a) => a.toLowerCase() === v.toLowerCase()) ?? v;
}
