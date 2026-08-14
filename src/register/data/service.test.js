import { getConfig } from '@edx/frontend-platform';
import {
  getAuthenticatedHttpClient,
  getHttpClient,
} from '@edx/frontend-platform/auth';

import {
  getFieldsValidations,
  registerRequest,
} from './service';
import {
  getRecaptchaToken,
  RECAPTCHA_ACTIONS,
} from '../../utils/recaptcha';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
  getHttpClient: jest.fn(),
}));

jest.mock('../../utils/recaptcha', () => {
  const actual = jest.requireActual('../../utils/recaptcha');

  return {
    ...actual,
    getRecaptchaToken: jest.fn(),
  };
});

describe('registration service', () => {
  const authenticatedPost = jest.fn();
  const validationPost = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    getConfig.mockReturnValue({
      LMS_BASE_URL: 'https://learn.centerforbusinessacceleration.com',
    });

    getAuthenticatedHttpClient.mockReturnValue({
      post: authenticatedPost,
    });

    getHttpClient.mockReturnValue({
      post: validationPost,
    });

    getRecaptchaToken.mockResolvedValue(
      'test-registration-token',
    );

    authenticatedPost.mockResolvedValue({
      data: {
        success: true,
        redirect_url:
          'https://learn.centerforbusinessacceleration.com/dashboard',
        authenticated_user: {
          username: 'cba_auth_test',
        },
      },
    });

    validationPost.mockResolvedValue({
      data: {
        email: '',
      },
    });
  });

  it('sends REGISTER reCAPTCHA token and action with registration', async () => {
    const registrationInformation = {
      email: 'learner@example.com',
      username: 'cba_auth_test',
      name: 'CBA Auth Test',
      password: 'ExamplePassword123!',
      country: 'US',
    };

    await registerRequest(
      registrationInformation,
    );

    expect(
      getRecaptchaToken,
    ).toHaveBeenCalledTimes(1);

    expect(
      getRecaptchaToken,
    ).toHaveBeenCalledWith(
      RECAPTCHA_ACTIONS.REGISTER,
    );

    expect(
      authenticatedPost,
    ).toHaveBeenCalledTimes(1);

    const [
      url,
      body,
      config,
    ] = authenticatedPost.mock.calls[0];

    expect(url).toBe(
      'https://learn.centerforbusinessacceleration.com'
      + '/api/user/v2/account/registration/',
    );

    const params = new URLSearchParams(body);

    expect(
      params.get('email'),
    ).toBe(
      'learner@example.com',
    );

    expect(
      params.get('username'),
    ).toBe(
      'cba_auth_test',
    );

    expect(
      params.get('recaptcha_token'),
    ).toBe(
      'test-registration-token',
    );

    expect(
      params.get('recaptcha_action'),
    ).toBe(
      RECAPTCHA_ACTIONS.REGISTER,
    );

    expect(config).toEqual({
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',
      },
      isPublic: true,
    });
  });

  it('fails closed before registration request when reCAPTCHA fails', async () => {
    getRecaptchaToken.mockRejectedValue(
      new Error(
        'reCAPTCHA Enterprise is unavailable',
      ),
    );

    await expect(
      registerRequest({
        email: 'learner@example.com',
      }),
    ).rejects.toThrow(
      'reCAPTCHA Enterprise is unavailable',
    );

    expect(
      authenticatedPost,
    ).not.toHaveBeenCalled();
  });

  it('does not add reCAPTCHA to realtime field validation', async () => {
    await getFieldsValidations({
      email: 'learner@example.com',
    });

    expect(
      validationPost,
    ).toHaveBeenCalledTimes(1);

    const [
      url,
      body,
      config,
    ] = validationPost.mock.calls[0];

    expect(url).toBe(
      'https://learn.centerforbusinessacceleration.com'
      + '/api/user/v1/validation/registration',
    );

    const params = new URLSearchParams(body);

    expect(
      params.get('email'),
    ).toBe(
      'learner@example.com',
    );

    expect(
      params.get('recaptcha_token'),
    ).toBeNull();

    expect(
      params.get('recaptcha_action'),
    ).toBeNull();

    expect(config).toEqual({
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',
      },
    });
  });
});
