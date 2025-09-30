const stripWrappingQuotes = (value) => value.replace(/^['"]+|['"]+$/g, '').trim();

const sanitizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const withoutQuotes = stripWrappingQuotes(value);
  if (!withoutQuotes) {
    return undefined;
  }

  const normalized = withoutQuotes.replace(/\/+$/, '');

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
    return normalized;
  } catch (error) {
    console.warn('[config] Invalid URL provided in environment variable:', value);
    return undefined;
  }
};

const DEFAULT_API_BASE_URL = 'http://localhost:3001';

const rawApiBase = sanitizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const rawSocketBase = sanitizeBaseUrl(import.meta.env.VITE_SOCKET_URL);

export const API_BASE_URL = rawApiBase || DEFAULT_API_BASE_URL;
export const SOCKET_BASE_URL = rawSocketBase || API_BASE_URL;

export const API_CONFIG_READY = Boolean(rawApiBase);
export const SOCKET_CONFIG_READY = Boolean(rawSocketBase || rawApiBase);
export const API_CONFIG_USING_FALLBACK = !rawApiBase;

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
