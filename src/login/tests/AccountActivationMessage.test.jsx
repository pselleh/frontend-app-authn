import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, screen,
} from '@testing-library/react';

import AccountActivationMessage from '../AccountActivationMessage';
import { ACCOUNT_ACTIVATION_MESSAGE } from '../data/constants';

describe('AccountActivationMessage', () => {
  beforeEach(() => {
    mergeConfig({
      MARKETING_EMAILS_OPT_IN: '',
    });
  });

  it('should match account already activated message', () => {
    render(
      <IntlProvider locale="en">
        <AccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.INFO} />
      </IntlProvider>,
    );

    const node = screen.getByRole('status');
    expect(node.id).toBe('account-activation-message');
    expect(node.textContent).toContain('Account already activated');
    expect(node.textContent).toContain('This account has already been activated. You can sign in below.');
  });

  it('should match account activated success message', () => {
    render(
      <IntlProvider locale="en">
        <AccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.SUCCESS} />
      </IntlProvider>,
    );

    const node = screen.getByRole('status');
    expect(node.textContent).toContain('Account activated');
    expect(node.textContent).toContain('Your account is ready. Sign in below to continue to your courses.');
  });

  it('should match account activation error message', () => {
    render(
      <IntlProvider locale="en">
        <AccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.ERROR} />
      </IntlProvider>,
    );

    const node = screen.getByRole('status');
    expect(node.textContent).toContain('Could not activate account');
    expect(node.textContent).toContain('contact support');
  });

  it('should not display anything for invalid message type', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <AccountActivationMessage messageType="invalid-message" />
      </IntlProvider>,
    );

    expect(container.querySelector('#account-activation-message')).toBeNull();
  });
});

describe('EmailConfirmationMessage', () => {
  beforeEach(() => {
    mergeConfig({
      MARKETING_EMAILS_OPT_IN: 'true',
    });
  });

  it('should match email already confirmed message', () => {
    render(
      <IntlProvider locale="en">
        <AccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.INFO} />
      </IntlProvider>,
    );

    const node = screen.getByRole('status');
    expect(node.textContent).toContain('Email already confirmed');
    expect(node.textContent).toContain('This email has already been confirmed. You can sign in below.');
  });

  it('should match email confirmation success message', () => {
    render(
      <IntlProvider locale="en">
        <AccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.SUCCESS} />
      </IntlProvider>,
    );

    const node = screen.getByRole('status');
    expect(node.textContent).toContain('Email confirmed');
    expect(node.textContent).toContain('Your email is confirmed. Sign in below to continue.');
  });

  it('should match email confirmation error message', () => {
    render(
      <IntlProvider locale="en">
        <AccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.ERROR} />
      </IntlProvider>,
    );

    const node = screen.getByRole('status');
    expect(node.textContent).toContain('Could not confirm email');
    expect(node.textContent).toContain('contact support');
  });
});
