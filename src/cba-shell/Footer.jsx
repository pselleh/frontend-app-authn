import { CBA_MARKETING_HOME } from '../data/constants';

import { cbaLogoUrl } from './cbaAssets';

export default function Footer() {
  const home = CBA_MARKETING_HOME;
  const logo = cbaLogoUrl('logo.svg');

  return (
    <footer className="footer">
      <div className="section-inner">
        <div className="row align-items-center footer-top">
          <div className="col-md-4">
            <div className="footer-brand d-flex align-items-center">
              <a href={`${home}/`}>
                <img src={logo} alt="Center for Business Acceleration" />
              </a>
            </div>
          </div>

          <div className="col-md-8">
            <nav className="footer-nav" aria-label="Footer">
              <ul className="footer-main-links list-unstyled mb-0">
                <li><a href={`${home}/`}>Home</a></li>
                <li><a href={`${home}/partners`}>Partners</a></li>
                <li><a href={`${home}/about`}>About</a></li>
                <li><a href={`${home}/contact`}>Contact</a></li>
              </ul>
            </nav>
          </div>
        </div>

        <nav className="footer-legal-links footer-legal-links--mobile" aria-label="Legal">
          <a href={`${home}/privacy`}>Privacy</a>
          <a href={`${home}/terms`}>Terms</a>
          <a href={`${home}/cookies`}>Cookies</a>
        </nav>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright mb-0">
            © 2025 Center for Business Acceleration. All rights reserved.
          </p>
          <nav className="footer-legal-links footer-legal-links--desktop" aria-label="Legal">
            <a href={`${home}/privacy`}>Privacy</a>
            <a href={`${home}/terms`}>Terms</a>
            <a href={`${home}/cookies`}>Cookies</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
