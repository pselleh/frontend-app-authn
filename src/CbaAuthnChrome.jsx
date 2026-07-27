import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Header from './cba-shell/Header';
import Footer from './cba-shell/Footer';

const THEME_KEY = 'cba-theme';

function getCookie(name) {
  if (typeof document === 'undefined') {
    return null;
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escaped}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function cookieDomainForHost(hostname) {
  if (
    !hostname
    || hostname === 'localhost'
    || /^[\d.]+$/.test(hostname)
  ) {
    return '';
  }

  const parts = hostname.split('.');

  if (parts.length >= 3) {
    return `.${parts.slice(-3).join('.')}`;
  }

  return `.${hostname}`;
}

function setThemeCookie(value) {
  if (
    typeof document === 'undefined'
    || typeof window === 'undefined'
  ) {
    return;
  }

  const domain = cookieDomainForHost(window.location.hostname);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const domainPart = domain ? `; Domain=${domain}` : '';

  document.cookie = [
    `${THEME_KEY}=${encodeURIComponent(value)}`,
    'Path=/',
    'Max-Age=31536000',
    'SameSite=Lax',
  ].join('; ') + domainPart + secure;
}

export default function CbaAuthnChrome({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const fromStorage = window.localStorage.getItem(THEME_KEY);
    const fromCookie = getCookie(THEME_KEY);
    const saved = fromCookie || fromStorage;

    setDark(saved === 'dark');
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (dark) {
      root.setAttribute('data-theme', 'dark');
      window.localStorage.setItem(THEME_KEY, 'dark');
      setThemeCookie('dark');
    } else {
      root.removeAttribute('data-theme');
      window.localStorage.setItem(THEME_KEY, 'light');
      setThemeCookie('light');
    }
  }, [dark]);

  return (
    <div className="cba-layout">
      <Header
        dark={dark}
        onToggleDark={setDark}
      />

      <main className="cba-layout__content">
        {children}
      </main>

      <Footer />
    </div>
  );
}

CbaAuthnChrome.propTypes = {
  children: PropTypes.node.isRequired,
};
