const sanitizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\/+$/, '');
};

const rawApiBase = sanitizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const rawSocketBase = sanitizeBaseUrl(import.meta.env.VITE_SOCKET_URL);

export const API_BASE_URL = rawApiBase || 'http://localhost:3001';
export const SOCKET_BASE_URL = rawSocketBase || API_BASE_URL;

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
