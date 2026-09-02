import { CBA_MARKETING_HOME } from '../data/constants';

const isLocalHost = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname || '';
  return host === 'localhost' || host === '127.0.0.1';
};

/**
 * Logo URLs for AuthN chrome.
 * Local dev: public/static/cba-theme/images/
 * Production: marketing site (LMS /authn/static often unavailable until collectstatic).
 */
export function cbaLogoUrl(filename) {
  if (isLocalHost()) {
    return `/static/cba-theme/images/${filename}`;
  }
  return `${CBA_MARKETING_HOME}/static/cba/images/${filename}`;
}

/**
 * Favicon for AuthN pages.
 * Root /favicon.* breaks under /authn/ (SPA HTML fallback). Use marketing SVG in prod.
 */
export function cbaFaviconUrl() {
  if (isLocalHost()) {
    return '/favicon.svg';
  }
  return `${CBA_MARKETING_HOME}/static/cba/images/favicon.svg`;
}
