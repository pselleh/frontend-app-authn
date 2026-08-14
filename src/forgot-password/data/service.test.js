import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { forgotPassword } from './service';
import {
  getRecaptchaToken,
  RECAPTCHA_ACTIONS,
} from '../../utils/recaptcha';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('../../utils/recaptcha', () => {
  const actual = jest.requireActual('../../utils/recaptcha');

  return {
    ...actual,
    getRecaptchaToken: jest.fn(),
  };
});

describe('forgotPassword service', () => {
  const post = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    getConfig.mockReturnValue({
      LMS_BASE_URL: 'https://learn.centerforbusinessacceleration.com',
    });

    getAuthenticatedHttpClient.mockReturnValue({
      post,
    });

    getRecaptchaToken.mockResolvedValue('test-reset-token');

    post.mockResolvedValue({
      data: {
        success: true,
      },
    });
  });

  it('sends the password-reset reCAPTCHA token and action', async () => {
    await forgotPassword('learner@example.com');

    expect(getRecaptchaToken).toHaveBeenCalledTimes(1);

    expect(getRecaptchaToken).toHaveBeenCalledWith(
      RECAPTCHA_ACTIONS.PASSWORD_RESET_REQUEST,
    );

    expect(post).toHaveBeenCalledTimes(1);

    const [
      url,
      body,
      config,
    ] = post.mock.calls[0];

    expect(url).toBe(
      'https://learn.centerforbusinessacceleration.com/account/password',
    );

    const params = new URLSearchParams(body);

    expect(params.get('email')).toBe(
      'learner@example.com',
    );

    expect(params.get('recaptcha_token')).toBe(
      'test-reset-token',
    );

    expect(params.get('recaptcha_action')).toBe(
      RECAPTCHA_ACTIONS.PASSWORD_RESET_REQUEST,
    );

    expect(config).toEqual({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      isPublic: true,
    });
  });

  it('fails closed before the HTTP request when reCAPTCHA fails', async () => {
    getRecaptchaToken.mockRejectedValue(
      new Error('reCAPTCHA Enterprise is unavailable'),
    );

    await expect(
      forgotPassword('learner@example.com'),
    ).rejects.toThrow(
      'reCAPTCHA Enterprise is unavailable',
    );

    expect(post).not.toHaveBeenCalled();
  });
});
