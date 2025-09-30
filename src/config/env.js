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

const DEFAULT_API_BASE_URL = 'https://irun-back.onrender.com';

const getCurrentOrigin = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return new URL(window.location.origin).origin;
  } catch (error) {
    console.warn('[config] Unable to determine window.origin:', error);
    return undefined;
  }
};

const rawEnvApiBase = import.meta.env.VITE_API_BASE_URL;
const rawEnvSocketBase = import.meta.env.VITE_SOCKET_URL;

const rawApiBase = sanitizeBaseUrl(rawEnvApiBase);
const rawSocketBase = sanitizeBaseUrl(rawEnvSocketBase);

const origin = getCurrentOrigin();

let apiBaseUrl = rawApiBase || DEFAULT_API_BASE_URL;
let apiFallbackReason = null;

if (!rawApiBase) {
  if (rawEnvApiBase) {
    apiFallbackReason = 'invalid-url';
  } else {
    apiFallbackReason = 'missing';
  }
} else if (origin && rawApiBase === origin && rawApiBase !== DEFAULT_API_BASE_URL) {
  apiBaseUrl = DEFAULT_API_BASE_URL;
  apiFallbackReason = 'same-as-frontend-origin';
  console.warn('[config] VITE_API_BASE_URL matches the frontend origin. Falling back to the default backend URL:', DEFAULT_API_BASE_URL);
}

const socketFallbackReason = !rawSocketBase && rawEnvSocketBase ? 'invalid-url' : null;

export const API_BASE_URL = apiBaseUrl;
export const SOCKET_BASE_URL = rawSocketBase || API_BASE_URL;

export const API_CONFIG_READY = Boolean(rawApiBase) && apiFallbackReason === null;
export const SOCKET_CONFIG_READY = Boolean(rawSocketBase || rawApiBase);
export const API_CONFIG_USING_FALLBACK = apiFallbackReason !== null;
export const API_CONFIG_FALLBACK_REASON = apiFallbackReason;
export const SOCKET_CONFIG_FALLBACK_REASON = rawSocketBase ? null : socketFallbackReason;
export const API_DEFAULT_BASE_URL = DEFAULT_API_BASE_URL;

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
