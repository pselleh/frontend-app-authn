import { CBA_MARKETING_HOME } from '../data/constants';

/**
 * Logo URLs for AuthN chrome.
 * Local dev: public/static/cba-theme/images/
 * Production: marketing site (LMS /authn/static often unavailable until collectstatic).
 */
export function cbaLogoUrl(filename) {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') {
      return `/static/cba-theme/images/${filename}`;
    }
  }

  return `${CBA_MARKETING_HOME}/static/cba/images/${filename}`;
}
