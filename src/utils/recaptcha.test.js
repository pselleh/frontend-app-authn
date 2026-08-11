import {
  getRecaptchaToken,
  RECAPTCHA_ACTIONS,
} from './recaptcha';
import { RECAPTCHA_SITE_KEY } from '../config/recaptcha';

describe('CBA reCAPTCHA Enterprise', () => {
  afterEach(() => {
    delete window.grecaptcha;
    jest.restoreAllMocks();
  });

  it('executes LOGIN with the configured site key', async () => {
    const execute = jest.fn().mockResolvedValue('test-token');

    window.grecaptcha = {
      enterprise: {
        ready: jest.fn((callback) => callback()),
        execute,
      },
    };

    await expect(
      getRecaptchaToken(RECAPTCHA_ACTIONS.LOGIN),
    ).resolves.toBe('test-token');

    expect(execute).toHaveBeenCalledWith(
      RECAPTCHA_SITE_KEY,
      { action: RECAPTCHA_ACTIONS.LOGIN },
    );
  });

  it('rejects an unsupported action', async () => {
    await expect(
      getRecaptchaToken('INVALID_ACTION'),
    ).rejects.toThrow('Invalid reCAPTCHA action.');
  });

  it('rejects when reCAPTCHA Enterprise is unavailable', async () => {
    await expect(
      getRecaptchaToken(RECAPTCHA_ACTIONS.LOGIN),
    ).rejects.toThrow('reCAPTCHA Enterprise is unavailable.');
  });

  it('rejects an empty token', async () => {
    window.grecaptcha = {
      enterprise: {
        ready: jest.fn((callback) => callback()),
        execute: jest.fn().mockResolvedValue(''),
      },
    };

    await expect(
      getRecaptchaToken(RECAPTCHA_ACTIONS.LOGIN),
    ).rejects.toThrow('reCAPTCHA returned an empty token.');
  });
});
