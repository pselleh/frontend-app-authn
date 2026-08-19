import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { Helmet } from 'react-helmet';

const normalizeUrl = value => (value || '').replace(/\/+$/, '');

const getSafeNextUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const requestedNext = params.get('next');

  if (!requestedNext) {
    return null;
  }

  const studioBaseUrl = normalizeUrl(getConfig().STUDIO_BASE_URL);

  if (!studioBaseUrl) {
    return null;
  }

  try {
    const requestedUrl = new URL(requestedNext);
    const studioUrl = new URL(studioBaseUrl);

    if (requestedUrl.origin !== studioUrl.origin) {
      return null;
    }

    return requestedUrl.href;
  } catch (error) {
    return null;
  }
};

const LoggedOutPage = () => {
  const config = getConfig();

  const lmsBaseUrl = normalizeUrl(config.LMS_BASE_URL);
  const nextUrl = getSafeNextUrl();

  /*
   * Learner login uses the canonical LMS /login endpoint.
   *
   * For a Studio-originated logout, return to Studio's login entry
   * point. Studio will then establish its normal OAuth flow through
   * the LMS/Authn MFE and preserve the Studio destination.
   */
  const signInUrl = nextUrl || `${lmsBaseUrl}/login`;
  const backUrl = nextUrl || lmsBaseUrl;

  const returningToStudio = Boolean(nextUrl);

  return (
    <>
      <Helmet>
        <title>Signed Out - Center for Business Acceleration</title>
      </Helmet>

      <main className="cba-logged-out">
        <div className="cba-logged-out__card">
          <h1>You are signed out</h1>

          <p>
            You have safely logged out of your account. You can sign in
            again anytime to continue.
          </p>

          <div className="cba-logged-out__actions">
            <a
              className="btn btn-primary"
              href={signInUrl}
              data-testid="logged-out-sign-in"
            >
              {returningToStudio ? 'Sign in to Studio' : 'Sign in again'}
            </a>

            <a
              className="btn btn-outline-primary"
              href={backUrl}
              data-testid="logged-out-back"
            >
              {returningToStudio ? 'Back to Studio' : 'Back to home'}
            </a>
          </div>
        </div>
      </main>
    </>
  );
};

export default LoggedOutPage;
