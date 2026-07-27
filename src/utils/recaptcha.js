const RECAPTCHA_SITE_KEY = '6LfUtmgtAAAAAAOoA4LdathmlyWycPtPUZ2HtH5JL';

export async function getRecaptchaToken(action) {
  if (!window.grecaptcha?.enterprise) {
    throw new Error('reCAPTCHA Enterprise is not loaded');
  }

  await new Promise((resolve) => {
    window.grecaptcha.enterprise.ready(resolve);
  });

  const token = await window.grecaptcha.enterprise.execute(
    RECAPTCHA_SITE_KEY,
    {
      action,
    },
  );

  if (!token) {
    throw new Error('Failed to obtain reCAPTCHA Enterprise token');
  }

  return token;
}
