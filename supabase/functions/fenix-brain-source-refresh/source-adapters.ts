export type IngestionAdapterKey =
  | "feni_official_html"
  | "bizhub_feni_html"
  | "health_registry_html"
  | "secondary_directory_html"
  | "smartfeni_partner_json";

export type AdapterItem = {
  name: string;
  source_url?: string;
  public_url?: string;
  category?: string;
  location?: string;
  district?: string;
  upazila?: string;
  code?: string;
  facility_id?: string;
  type?: string;
  agency?: string;
  ownership?: string;
  name_bn?: string;
  is_private?: boolean;
};

export type IngestionSnapshot = {
  adapter: IngestionAdapterKey;
  source_url: string;
  page_title: string;
  record_count: number;
  items: AdapterItem[];
  headings: string[];
  discovery_links: Array<{ label: string; url: string }>;
  excerpt: string;
  warnings: string[];
  review_required: true;
};

const MAX_ITEMS = 80;
const MAX_LINKS = 80;
const MAX_EXCERPT = 3200;

const NAV_NOISE = new Set([
  "home", "about", "about us", "contact", "contact us", "privacy", "privacy policy",
  "terms", "terms of service", "login", "log in", "sign in", "register", "signup",
  "sign up", "search", "menu", "more", "view all", "read more", "next", "previous",
  "facebook", "instagram", "youtube", "x", "twitter", "help", "faq", "বাংলা",
  "english", "হোম", "আমাদের সম্পর্কে", "যোগাযোগ", "প্রাইভেসি পলিসি",
  "ব্যবহারের শর্তাবলী", "আরও দেখুন", "বিস্তারিত",
]);

const PERSONAL_OR_SENSITIVE_TERMS = [
  "blood donor", "blood group", "donor", "rider", "delivery hero", "rent a room",
  "room rent", "flat rent", "job applicant", "personal profile", "lost and found",
  "রক্তদাতা", "রক্তের গ্রুপ", "রাইডার", "ডেলিভারি হিরো", "বাসা ভাড়া", "বাড়ি ভাড়া",
  "চাকরিপ্রার্থী", "ব্যক্তিগত প্রোফাইল", "হারানো", "পাওয়া",
];

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&", quot: '"', apos: "'", nbsp: " ", lt: "<", gt: ">",
    ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”",
    ldquo: "“", bull: "•", hellip: "…",
  };
  return value
    .replace(/&#(x[0-9a-f]+|[0-9]+);?/gi, (_match, number: string) => {
      const parsed = number.toLowerCase().startsWith("x")
        ? Number.parseInt(number.slice(1), 16)
        : Number.parseInt(number, 10);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 0x10ffff) return " ";
      try { return String.fromCodePoint(parsed); } catch { return " "; }
    })
    .replace(/&([a-z]+);/gi, (match, name: string) => named[name.toLowerCase()] ?? match)
    .replace(/\u00a0/g, " ");
}

function textFromHtml(html: string): string {
  return decodeHtml(html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|form|button|nav|footer|header|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|section|article|main|li|h[1-6]|tr|td|th|dd|dt)>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[\t\f\v ]+/g, " ")
    .replace(/ *\n+ */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function mainHtml(html: string): string {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)
    || html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
    || html.match(/<(?:div|section)\b[^>]*(?:id|class)=["'][^"']*(?:main-content|page-content|content-area|article-content|entry-content)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i);
  return main?.[1] ?? html;
}

function getPageTitle(html: string): string {
  const candidates = [
    html.match(/<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/i)?.[1],
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1],
    html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1],
  ].filter((value): value is string => Boolean(value));
  return textFromHtml(candidates[0] ?? "").slice(0, 240) || "Untitled source page";
}

function getHeadings(html: string): string[] {
  const headings: string[] = [];
  for (const match of html.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)) {
    const value = textFromHtml(match[1]).slice(0, 180);
    if (value.length >= 3 && !headings.includes(value)) headings.push(value);
    if (headings.length >= 40) break;
  }
  return headings;
}

function normalizedUrl(href: string, sourceUrl: string): string | null {
  try {
    const source = new URL(sourceUrl);
    const url = new URL(decodeHtml(href.trim()), source);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (url.hostname.toLowerCase() !== source.hostname.toLowerCase()) return null;
    url.hash = "";
    if (url.pathname.length > 240 || url.href.length > 800) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractAnchors(html: string, sourceUrl: string): Array<{ label: string; url: string }> {
  const out: Array<{ label: string; url: string }> = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attributes = match[1] ?? "";
    const href = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!href) continue;
    const url = normalizedUrl(href, sourceUrl);
    if (!url || seen.has(url)) continue;
    const label = (
      textFromHtml(match[2]) ||
      decodeHtml(attributes.match(/\b(?:aria-label|title)\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "")
    ).replace(/\s+/g, " ").trim().slice(0, 180);
    if (label.length < 3 || label.length > 180) continue;
    if (NAV_NOISE.has(label.toLowerCase())) continue;
    if (/\.(?:css|js|png|jpe?g|gif|svg|webp|pdf|zip|woff2?)(?:$|\?)/i.test(url)) continue;
    seen.add(url);
    out.push({ label, url });
    if (out.length >= MAX_LINKS) break;
  }
  return out;
}

function likelyListingLink(link: { label: string; url: string }): boolean {
  const url = new URL(link.url);
  const path = url.pathname.toLowerCase();
  const label = link.label.toLowerCase().trim();
  if (NAV_NOISE.has(label)) return false;
  if (/\/(?:about|contact|privacy|terms|login|logout|register|signup|search|cart|checkout|account|admin|feed|news|blog|faq|help|settings)(?:\/|$)/i.test(path)) return false;
  if (/\/(?:assets|images|fonts|static|css|js|uploads\/avatars)(?:\/|$)/i.test(path)) return false;
  return /\/(?:business|businesses|directory|directories|listing|listings|company|companies|shop|shops|store|stores|service|services|supplier|suppliers|clinic|hospital|facility|facilities|organization|organizations|place|places|profile|profiles|category|categories)(?:\/|$)/i.test(path)
    || /^\/[a-z0-9]+(?:-[a-z0-9]+){1,}(?:\/|$)/i.test(path)
    || /^\/[a-z0-9-]{4,}\/?$/i.test(path);
}

function extractJsonLd(html: string, sourceUrl: string): AdapterItem[] {
  const items: AdapterItem[] = [];
  const seen = new Set<string>();
  const permittedTypes = /localbusiness|store|restaurant|pharmacy|hospital|medicalclinic|medicalorganization|school|educationalorganization|professionalservice|shoppingcenter|supermarket|governmentorganization|touristattraction|civicstructure/i;

  const visit = (value: unknown, depth = 0) => {
    if (depth > 8 || items.length >= MAX_ITEMS || !value) return;
    if (Array.isArray(value)) {
      for (const child of value) visit(child, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    const object = value as Record<string, unknown>;
    const typeRaw = object["@type"];
    const type = (Array.isArray(typeRaw) ? typeRaw : [typeRaw]).map(String).join(" ");
    const name = String(object.name ?? object.legalName ?? "").trim();
    const urlRaw = String(object.url ?? object["@id"] ?? "").trim();
    let sourceLink: string | undefined;
    if (urlRaw) sourceLink = normalizedUrl(urlRaw, sourceUrl) ?? undefined;
    const path = sourceLink ? new URL(sourceLink).pathname : "";
    const isPlatformHomepage = sourceLink && path === "/" &&
      new URL(sourceLink).hostname.toLowerCase() === new URL(sourceUrl).hostname.toLowerCase();

    if (name.length >= 2 && permittedTypes.test(type) && !isPlatformHomepage) {
      const address = object.address && typeof object.address === "object"
        ? object.address as Record<string, unknown>
        : {};
      const addressParts = [
        address.addressLocality, address.addressRegion, address.postalCode,
      ].map((part) => String(part ?? "").trim()).filter(Boolean);
      const category = String(object.additionalType ?? object.category ?? typeRaw ?? "").slice(0, 120);
      const key = (sourceLink ?? "") + "|" + name.toLocaleLowerCase("en");
      if (!seen.has(key)) {
        seen.add(key);
        items.push({
          name: name.slice(0, 180),
          ...(sourceLink ? { source_url: sourceLink } : {}),
          ...(category ? { category } : {}),
          ...(addressParts.length ? { location: addressParts.join(", ").slice(0, 180) } : {}),
          type: type.slice(0, 120),
        });
      }
    }

    for (const [key, child] of Object.entries(object)) {
      if (key === "address" || key === "geo" || key === "image" || key === "logo" ||
          key === "sameAs" || key === "telephone" || key === "email") continue;
      if (child && typeof child === "object") visit(child, depth + 1);
    }
  };

  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(match[1]));
    } catch {
      // Invalid or partial JSON-LD is ignored; the page remains eligible for
      // the normal link/title extraction path and still requires review.
    }
    if (items.length >= MAX_ITEMS) break;
  }
  return items;
}

function extractDirectoryItems(html: string, sourceUrl: string): AdapterItem[] {
  const jsonLd = extractJsonLd(html, sourceUrl);
  const seen = new Set(jsonLd.map((item) => (item.source_url ?? "") + "|" + item.name.toLowerCase()));
  const items = [...jsonLd];
  for (const link of extractAnchors(mainHtml(html), sourceUrl)) {
    if (!likelyListingLink(link)) continue;
    const key = link.url + "|" + link.label.toLowerCase();
    if (seen.has(key) || items.length >= MAX_ITEMS) continue;
    seen.add(key);
    items.push({ name: link.label, source_url: link.url });
  }
  return items.slice(0, MAX_ITEMS);
}

function collectTextSnapshot(html: string, sourceUrl: string): IngestionSnapshot {
  const body = textFromHtml(mainHtml(html));
  const excerpt = body.slice(0, MAX_EXCERPT);
  const links = extractAnchors(mainHtml(html), sourceUrl);
  const headings = getHeadings(html);
  return {
    adapter: "feni_official_html",
    source_url: sourceUrl,
    page_title: getPageTitle(html),
    record_count: headings.length + links.length,
    items: [],
    headings,
    discovery_links: links.filter((link) =>
      /service|notice|office|district|upazila|union|tour|history|geograph|administration|school|health|hospital|market|যোগাযোগ|সেবা|নোটিশ|উপজেলা|ইউনিয়ন|ইউনিয়ন|দর্শনীয়|দর্শনীয়|পরিচিতি|বাজার|হাসপাতাল/i.test(link.label + " " + link.url)
    ).slice(0, 40),
    excerpt,
    warnings: ["Source snapshot only; extracted text/links are staged for review and do not create or update canonical facts."],
    review_required: true,
  };
}

function parseHtmlTableCells(row: string, tag: "th" | "td"): string[] {
  return [...row.matchAll(new RegExp("<" + tag + "\\b[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "gi"))]
    .map((match) => textFromHtml(match[1]).replace(/\s+/g, " ").trim());
}

function headerKey(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function parseHealthRegistry(html: string, sourceUrl: string): IngestionSnapshot {
  const candidates: AdapterItem[] = [];
  let sawDistrictColumn = false;

  for (const tableMatch of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    const table = tableMatch[1];
    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
    if (rows.length < 2) continue;

    let headers = parseHtmlTableCells(rows[0], "th");
    if (headers.length < 3) headers = parseHtmlTableCells(rows[0], "td");
    if (headers.length < 3) continue;

    const normalized = headers.map(headerKey);
    const index = (patterns: RegExp[]) => normalized.findIndex((value) => patterns.some((pattern) => pattern.test(value)));
    const idIndex = index([/^id$/, /facility id/, /organization id/]);
    const nameIndex = index([/^name$/, /facility name/, /organization name/]);
    const banglaIndex = index([/name bangla/, /bangla name/, /name in bangla/]);
    const codeIndex = index([/^code$/, /facility code/]);
    const agencyIndex = index([/^agency$/, /organization agency/]);
    const typeIndex = index([/^type$/, /facility type/, /organization type/]);
    const districtIndex = index([/^district$/, /district name/]);
    const divisionIndex = index([/^division$/, /division name/]);
    const upazilaIndex = index([/^upazila$/, /upazila name/]);
    const municipalityIndex = index([/paurasava/, /municipality/, /city corporation/]);
    const unionIndex = index([/^union$/, /union name/]);
    const wardIndex = index([/^ward$/, /ward name/]);
    const ownershipIndex = index([/primary ownership/, /^ownership$/]);
    const privateIndex = index([/private/]);
    if (districtIndex < 0 || nameIndex < 0) continue;

    sawDistrictColumn = true;
    for (const row of rows.slice(1)) {
      const cells = parseHtmlTableCells(row, "td");
      if (cells.length <= Math.max(districtIndex, nameIndex)) continue;
      const district = cells[districtIndex] ?? "";
      if (!/^(?:feni|ফেনী)$/i.test(district.trim())) continue;
      const division = divisionIndex >= 0 ? cells[divisionIndex] ?? "" : "";
      if (division && !/^(?:chattogram|chittagong|চট্টগ্রাম)$/i.test(division.trim())) continue;

      const name = (cells[nameIndex] ?? "").trim();
      if (name.length < 2) continue;
      const item: AdapterItem = {
        name: name.slice(0, 180),
        district: "Feni",
        ...(banglaIndex >= 0 && cells[banglaIndex] ? { name_bn: cells[banglaIndex].slice(0, 180) } : {}),
        ...(idIndex >= 0 && cells[idIndex] ? { facility_id: cells[idIndex].slice(0, 80) } : {}),
        ...(codeIndex >= 0 && cells[codeIndex] ? { code: cells[codeIndex].slice(0, 80) } : {}),
        ...(typeIndex >= 0 && cells[typeIndex] ? { type: cells[typeIndex].slice(0, 120) } : {}),
        ...(agencyIndex >= 0 && cells[agencyIndex] ? { agency: cells[agencyIndex].slice(0, 120) } : {}),
        ...(upazilaIndex >= 0 && cells[upazilaIndex] ? { upazila: cells[upazilaIndex].slice(0, 120) } : {}),
        ...(municipalityIndex >= 0 && cells[municipalityIndex] ? { location: cells[municipalityIndex].slice(0, 120) } : {}),
        ...(unionIndex >= 0 && cells[unionIndex] ? { location: [cells[municipalityIndex] ?? "", cells[unionIndex]].filter(Boolean).join(", ").slice(0, 180) } : {}),
        ...(ownershipIndex >= 0 && cells[ownershipIndex] ? { ownership: cells[ownershipIndex].slice(0, 120) } : {}),
        ...(privateIndex >= 0 && cells[privateIndex] ? { is_private: /^(1|yes|true|private)$/i.test(cells[privateIndex]) } : {}),
        source_url: sourceUrl,
      };
      candidates.push(item);
      if (candidates.length >= MAX_ITEMS) break;
    }
    if (candidates.length >= MAX_ITEMS) break;
  }

  if (!sawDistrictColumn) {
    throw new Error("health_registry_schema_changed: expected a public organization table with Name and District columns");
  }
  if (!candidates.length) {
    throw new Error("health_registry_feni_filter_required: the report returned no Feni rows. Configure and verify a report URL/API filtered to Feni before activating ingestion.");
  }

  const headings = getHeadings(html);
  return {
    adapter: "health_registry_html",
    source_url: sourceUrl,
    page_title: getPageTitle(html),
    record_count: candidates.length,
    items: candidates,
    headings,
    discovery_links: [],
    excerpt: "DGHS public facility registry. Only rows whose published District field equals Feni are retained. Public phone/email fields are deliberately excluded from the staged snapshot.",
    warnings: ["Health-facility records are staged for verification; they are not statements of opening hours, current services, emergency availability, or clinical quality."],
    review_required: true,
  };
}

function parseSmartFeniPartnerJson(raw: string, sourceUrl: string): IngestionSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("smartfeni_partner_feed_invalid_json: expected an authorized JSON feed, not a public HTML page");
  }

  const containers: unknown[] = [];
  const visit = (value: unknown, depth = 0) => {
    if (depth > 5 || !value) return;
    if (Array.isArray(value)) {
      containers.push(...value);
      return;
    }
    if (typeof value !== "object") return;
    const object = value as Record<string, unknown>;
    for (const key of ["businesses", "services", "items", "records", "results", "data"]) {
      const child = object[key];
      if (Array.isArray(child)) containers.push(...child);
      else if (child && typeof child === "object") visit(child, depth + 1);
    }
  };
  visit(parsed);

  const items: AdapterItem[] = [];
  const seen = new Set<string>();
  const excluded = PERSONAL_OR_SENSITIVE_TERMS.join("|");
  for (const rawItem of containers) {
    if (!rawItem || typeof rawItem !== "object") continue;
    const row = rawItem as Record<string, unknown>;
    const name = String(row.business_name ?? row.businessName ?? row.shop_name ?? row.shopName ?? row.organization_name ?? row.organizationName ?? "").trim();
    const category = String(row.category_name ?? row.categoryName ?? row.category ?? row.service_type ?? row.serviceType ?? "").trim();
    const entityType = String(row.entity_type ?? row.entityType ?? row.record_type ?? row.recordType ?? row.type ?? "").trim();
    const combined = (category + " " + entityType).toLowerCase();

    // Smart Feni's Terms of Service prohibit scraping/bot activity. This adapter
    // accepts only a source-owner-authorized partner feed and intentionally excludes
    // personal classifieds, job applications, donor profiles and other sensitive data.
    if (!name || name.length < 2) continue;
    if (new RegExp(excluded, "i").test(combined)) continue;
    if (!/business|shop|store|service provider|organization|clinic|hospital|pharmacy|restaurant/i.test(entityType + " " + category)) continue;

    const district = String(row.district ?? row.district_name ?? row.districtName ?? "").trim();
    // Never infer that an unlabelled record belongs to Feni. Require an explicit
    // Feni district field even when the provider says it is a local feed.
    if (!district || !/^(?:feni|ফেনী)$/i.test(district)) continue;
    const publicUrlRaw = String(row.public_url ?? row.publicUrl ?? row.website ?? row.profile_url ?? row.profileUrl ?? "").trim();
    let publicUrl: string | undefined;
    try {
      if (publicUrlRaw) {
        const candidate = new URL(publicUrlRaw);
        if (candidate.protocol === "https:" && !candidate.username && !candidate.password) publicUrl = candidate.toString().slice(0, 800);
      }
    } catch {
      // Invalid public links are omitted; they must not fail otherwise valid records.
    }

    const key = (publicUrl ?? "") + "|" + name.toLocaleLowerCase("en");
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      name: name.slice(0, 180),
      ...(category ? { category: category.slice(0, 120) } : {}),
      district: "Feni",
      ...(String(row.upazila ?? row.upazila_name ?? row.upazilaName ?? "").trim()
        ? { upazila: String(row.upazila ?? row.upazila_name ?? row.upazilaName).trim().slice(0, 120) }
        : {}),
      ...(String(row.area ?? row.location ?? row.address_area ?? "").trim()
        ? { location: String(row.area ?? row.location ?? row.address_area).trim().slice(0, 180) }
        : {}),
      source_url: sourceUrl,
      ...(publicUrl ? { public_url: publicUrl } : {}),
      ...(entityType ? { type: entityType.slice(0, 120) } : {}),
    });
    if (items.length >= MAX_ITEMS) break;
  }

  if (!items.length) {
    throw new Error("smartfeni_partner_feed_no_public_business_records: only public business/service records from an authorized feed are accepted");
  }

  return {
    adapter: "smartfeni_partner_json",
    source_url: sourceUrl,
    page_title: "Smart Feni authorized partner feed",
    record_count: items.length,
    items,
    headings: [],
    discovery_links: [],
    excerpt: "Only allowlisted public business/service fields were retained. Personal classifieds, donor profiles, contacts, identity data, and private fields were dropped.",
    warnings: ["The feed must be authorized by Smart Feni. All imported records require human review and corroboration before becoming canonical FeniX entities."],
    review_required: true,
  };
}

export function isIngestionAdapter(value: string): value is IngestionAdapterKey {
  return value === "feni_official_html"
    || value === "bizhub_feni_html"
    || value === "health_registry_html"
    || value === "secondary_directory_html"
    || value === "smartfeni_partner_json";
}

export function requiresPartnerAuthorization(value: string): boolean {
  return value === "smartfeni_partner_json";
}

export function parseIngestionAdapter(
  adapter: IngestionAdapterKey,
  raw: string,
  sourceUrl: string,
): IngestionSnapshot {
  if (!raw || raw.trim().length < 20) throw new Error("adapter_source_too_short");
  if (adapter === "feni_official_html") return collectTextSnapshot(raw, sourceUrl);
  if (adapter === "health_registry_html") return parseHealthRegistry(raw, sourceUrl);
  if (adapter === "smartfeni_partner_json") return parseSmartFeniPartnerJson(raw, sourceUrl);

  const pageTitle = getPageTitle(raw);
  const items = extractDirectoryItems(raw, sourceUrl);
  const headings = getHeadings(raw);
  const links = extractAnchors(mainHtml(raw), sourceUrl).filter(likelyListingLink).slice(0, 40);
  const excerpt = textFromHtml(mainHtml(raw)).slice(0, 1800);

  return {
    adapter,
    source_url: sourceUrl,
    page_title: pageTitle,
    record_count: items.length,
    items,
    headings,
    discovery_links: links,
    excerpt,
    warnings: [
      "Directory results are secondary-source leads only. Names/categories/locations are not verified and must be checked against the primary source or business owner.",
      "Phone numbers, email addresses, personal-profile fields and long copyrighted page text are not copied into the candidate snapshot.",
    ],
    review_required: true,
  };
}
