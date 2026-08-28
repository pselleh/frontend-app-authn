import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { CBA_MARKETING_HOME, LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import { updatePathWithQueryParams } from '../data/utils';

import { cbaLogoUrl } from './cbaAssets';

export default function Header({ dark = false, onToggleDark = null }) {
  const home = CBA_MARKETING_HOME;
  const loginPath = updatePathWithQueryParams(LOGIN_PAGE);
  const registerPath = updatePathWithQueryParams(REGISTER_PAGE);
  const logoLight = cbaLogoUrl('logo-dark.svg');
  const logoDark = cbaLogoUrl('logo.svg');
  const [navOpen, setNavOpen] = useState(false);

  const handleToggle = (event) => {
    if (typeof onToggleDark === 'function') {
      onToggleDark(event.target.checked);
    }
  };

  const toggleNav = () => {
    setNavOpen((open) => !open);
  };

  const closeNav = () => {
    setNavOpen(false);
  };

  return (
    <div className="cba-nav-wrap fixed-top">
      <nav className="navbar cba-navbar navbar-expand-lg navbar-light">
        <div className="container cba-nav__inner">
          <a className="navbar-brand cba-nav__brand d-flex align-items-center" href={`${home}/`}>
            <img
              className="cba-nav__logo cba-nav__logo--light"
              src={logoLight}
              alt="Center for Business Acceleration"
            />
            <img
              className="cba-nav__logo cba-nav__logo--dark"
              src={logoDark}
              alt=""
            />
          </a>

          <div className="cba-nav__header-controls d-flex align-items-center">
            <div className="custom-control custom-switch cba-nav__theme-switch d-flex align-items-center">
              <input
                type="checkbox"
                className="custom-control-input"
                id="themeToggle"
                aria-label="Toggle dark mode"
                checked={dark}
                onChange={handleToggle}
              />
              <label className="custom-control-label mb-0" htmlFor="themeToggle">
                <span className="cba-nav__theme-label">Dark mode</span>
              </label>
            </div>

            <button
              className="navbar-toggler cba-nav__toggler d-lg-none"
              type="button"
              aria-controls="navbarNav"
              aria-expanded={navOpen}
              aria-label="Toggle navigation"
              onClick={toggleNav}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          <div
            className={`navbar-collapse cba-nav__collapse${navOpen ? ' cba-nav__collapse--open' : ''}`}
            id="navbarNav"
          >
            <div className="cba-nav__row d-flex flex-column flex-lg-row align-items-lg-center w-100">
              <ul className="navbar-nav cba-nav__main align-items-lg-center mb-0">
                <li className="nav-item">
                  <a className="nav-link" href={`${home}/veterans`} onClick={closeNav}>Veterans</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href={`${home}/about`} onClick={closeNav}>About</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href={`${home}/contact`} onClick={closeNav}>Contact</a>
                </li>
              </ul>

              <div className="cba-nav__actions d-flex flex-column flex-lg-row align-items-lg-center">
                <Link to={loginPath} className="cba-nav__login" onClick={closeNav}>
                  Login
                </Link>
                <Link to={registerPath} className="cba-nav__enroll" onClick={closeNav}>
                  Enroll now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

Header.propTypes = {
  dark: PropTypes.bool,
  onToggleDark: PropTypes.func,
};
