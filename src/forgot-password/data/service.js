import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import formurlencoded from 'form-urlencoded';

import {
  getRecaptchaToken,
  RECAPTCHA_ACTIONS,
} from '../../utils/recaptcha';

// eslint-disable-next-line import/prefer-default-export
export async function forgotPassword(email) {
  const recaptchaToken = await getRecaptchaToken(
    RECAPTCHA_ACTIONS.PASSWORD_RESET_REQUEST,
  );

  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    isPublic: true,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      `${getConfig().LMS_BASE_URL}/account/password`,
      formurlencoded({
        email,
        recaptcha_token: recaptchaToken,
        recaptcha_action: RECAPTCHA_ACTIONS.PASSWORD_RESET_REQUEST,
      }),
      requestConfig,
    )
    .catch((e) => {
      throw (e);
    });

  return data;
}
