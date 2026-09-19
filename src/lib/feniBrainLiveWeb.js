const ALLOWED_HOSTS = new Set([
  'bangladesh.gov.bd',
  'feni.gov.bd',
  'bbs.feni.gov.bd',
  'sadar.feni.gov.bd',
  'chhagalnaiya.feni.gov.bd',
  'daganbhuiyan.feni.gov.bd',
  'fulgazi.feni.gov.bd',
  'parshuram.feni.gov.bd',
  'sonagazi.feni.gov.bd',
  'lged.sadar.feni.gov.bd',
]);

const CURRENTNESS_TERMS = [
  'আজ', 'এখন', 'সর্বশেষ', 'হালনাগাদ', 'আপডেট', 'নোটিশ', 'নতুন',
  'খবর', 'সাম্প্রতিক', 'বর্তমান', 'আজকের', 'এই মুহূর্তে',
  'latest', 'today', 'now', 'current', 'updated', 'update',
  'notice', 'notices', 'news', 'new', 'recent', 'tender',
];

const FALLBACK_SOURCES = [
  {
    source_title: 'Feni District Administration',
    source_url: 'https://feni.gov.bd/',
    trust_tier: 1,
  },
  {
    source_title: 'District Statistics Office, Feni',
    source_url: 'https://bbs.feni.gov.bd/',
    trust_tier: 1,
  },
  {
    source_title: 'Bangladesh National Portal',
    source_url: 'https://bangladesh.gov.bd/',
    trust_tier: 1,
  },
];

const MAX_SOURCES = 3;
const MAX_TEXT = 7000;
const TIMEOUT_MS = 6500;

function isAllowedSourceUrl(raw) {
  try {
    const url = new URL(raw);
    return (
      url.protocol === 'https:' &&
      ALLOWED_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

function decodeEntities(input) {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function extractText(html) {
  let text = html;

  for (const tag of ['script', 'style', 'noscript', 'svg', 'template']) {
    const re = new RegExp(
      '<' + tag + '[^>]*>[\\s\\S]*?<\\/' + tag + '>',
      'gi',
    );
    text = text.replace(re, ' ');
  }

  return decodeEntities(
    text
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\t\r]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ ]{2,}/g, ' ')
      .trim(),
  ).slice(0, MAX_TEXT);
}

export function shouldUseLiveWeb(query) {
  if (typeof query !== 'string') return false;
  const lower = query.toLowerCase();
  return CURRENTNESS_TERMS.some((term) =>
    lower.includes(term.toLowerCase()),
  );
}

async function fetchOne(url, sourceTitle) {
  if (!isAllowedSourceUrl(url)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    TIMEOUT_MS,
  );
  const visited = new Set();
  let currentUrl = url;

  try {
    for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
      if (!isAllowedSourceUrl(currentUrl) || visited.has(currentUrl)) {
        return null;
      }

      visited.add(currentUrl);

      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'FeniX-Feni-Brain-Live/1.0',
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) return null;

        const nextUrl = new URL(location, currentUrl).toString();
        if (!isAllowedSourceUrl(nextUrl)) {
          console.warn('Feni Brain blocked non-allowlisted redirect:', {
            source: sourceTitle,
            from: currentUrl,
          });
          return null;
        }

        currentUrl = nextUrl;
        continue;
      }

      if (!response.ok) return null;

      const contentType = response.headers.get('content-type') || '';
      if (
        !contentType.includes('text/html') &&
        !contentType.includes('application/xhtml+xml')
      ) {
        return null;
      }

      const raw = await response.text();
      const content = extractText(raw);

      if (content.length < 100) return null;

      return {
        title: sourceTitle,
        url: currentUrl,
        content,
        fetched_at: new Date().toISOString(),
        http_status: response.status,
      };
    }

    return null;
  } catch (error) {
    const details =
      error && typeof error === 'object'
        ? error
        : { message: String(error) };

    console.error('Feni Brain live source failed:', {
      name:
        typeof details.name === 'string'
          ? details.name
          : 'unknown',
      message:
        typeof details.message === 'string'
          ? details.message
          : 'unknown',
    });

    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchLiveFeniSources(sources) {
  const usable = [];
  const seen = new Set();

  const candidates = [
    ...(Array.isArray(sources) ? sources : []),
    ...FALLBACK_SOURCES,
  ];

  for (const source of candidates) {
    if (
      !source ||
      !source.source_url ||
      !isAllowedSourceUrl(source.source_url)
    ) {
      continue;
    }

    if (Number(source.trust_tier || 99) !== 1) continue;
    if (seen.has(source.source_url)) continue;

    seen.add(source.source_url);
    usable.push(source);

    if (usable.length >= MAX_SOURCES) break;
  }

  const results = await Promise.all(
    usable.map((source) =>
      fetchOne(
        source.source_url,
        source.source_title || 'Official source',
      ),
    ),
  );

  return results.filter(Boolean);
}
