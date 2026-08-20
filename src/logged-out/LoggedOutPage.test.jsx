import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { render, screen } from '@testing-library/react';

import LoggedOutPage from './LoggedOutPage';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

const LMS_BASE_URL = 'https://learn.centerforbusinessacceleration.com';
const MARKETING_SITE_BASE_URL = 'https://centerforbusinessacceleration.com';
const STUDIO_BASE_URL = 'https://studio.centerforbusinessacceleration.com';

const setLocationSearch = (search = '') => {
  delete window.location;
  window.location = { search };
};

describe('LoggedOutPage', () => {
  beforeEach(() => {
    getConfig.mockReturnValue({
      LMS_BASE_URL,
      MARKETING_SITE_BASE_URL,
      STUDIO_BASE_URL,
    });

    setLocationSearch();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses the canonical LMS login when there is no Studio next URL', () => {
    render(<LoggedOutPage />);

    expect(screen.getByTestId('logged-out-sign-in').getAttribute('href'))
      .toBe(`${LMS_BASE_URL}/login`);

    expect(screen.getByTestId('logged-out-back').getAttribute('href'))
      .toBe(MARKETING_SITE_BASE_URL);

    expect(screen.getByTestId('logged-out-sign-in').textContent)
      .toBe('Sign in again');

    expect(screen.getByTestId('logged-out-back').textContent)
      .toBe('Back to home');
  });

  it('returns a Studio logout to the Studio origin', () => {
    const next = `${STUDIO_BASE_URL}/`;

    setLocationSearch(`?next=${encodeURIComponent(next)}`);

    render(<LoggedOutPage />);

    expect(screen.getByTestId('logged-out-sign-in').getAttribute('href'))
      .toBe(next);

    expect(screen.getByTestId('logged-out-back').getAttribute('href'))
      .toBe(next);

    expect(screen.getByTestId('logged-out-sign-in').textContent)
      .toBe('Sign in to Studio');

    expect(screen.getByTestId('logged-out-back').textContent)
      .toBe('Back to Studio');
  });

  it('preserves an allowed Studio subpath', () => {
    const next = `${STUDIO_BASE_URL}/course/course-v1:CBA+TEST+2026`;

    setLocationSearch(`?next=${encodeURIComponent(next)}`);

    render(<LoggedOutPage />);

    expect(screen.getByTestId('logged-out-sign-in').getAttribute('href'))
      .toBe(next);

    expect(screen.getByTestId('logged-out-back').getAttribute('href'))
      .toBe(next);
  });

  it('rejects an external next URL', () => {
    const next = 'https://example.com/steal-session';

    setLocationSearch(`?next=${encodeURIComponent(next)}`);

    render(<LoggedOutPage />);

    expect(screen.getByTestId('logged-out-sign-in').getAttribute('href'))
      .toBe(`${LMS_BASE_URL}/login`);

    expect(screen.getByTestId('logged-out-back').getAttribute('href'))
      .toBe(MARKETING_SITE_BASE_URL);
  });

  it('rejects a deceptive Studio hostname', () => {
    const next = 'https://studio.centerforbusinessacceleration.com.evil.example/';

    setLocationSearch(`?next=${encodeURIComponent(next)}`);

    render(<LoggedOutPage />);

    expect(screen.getByTestId('logged-out-sign-in').getAttribute('href'))
      .toBe(`${LMS_BASE_URL}/login`);

    expect(screen.getByTestId('logged-out-back').getAttribute('href'))
      .toBe(MARKETING_SITE_BASE_URL);
  });

  it('rejects a relative next URL', () => {
    setLocationSearch('?next=%2Fhome%2F');

    render(<LoggedOutPage />);

    expect(screen.getByTestId('logged-out-sign-in').getAttribute('href'))
      .toBe(`${LMS_BASE_URL}/login`);

    expect(screen.getByTestId('logged-out-back').getAttribute('href'))
      .toBe(MARKETING_SITE_BASE_URL);
  });

  it('rejects a malformed next URL', () => {
    setLocationSearch('?next=not-a-url');

    render(<LoggedOutPage />);

    expect(screen.getByTestId('logged-out-sign-in').getAttribute('href'))
      .toBe(`${LMS_BASE_URL}/login`);

    expect(screen.getByTestId('logged-out-back').getAttribute('href'))
      .toBe(MARKETING_SITE_BASE_URL);
  });
});
