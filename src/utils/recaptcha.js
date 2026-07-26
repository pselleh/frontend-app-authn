export function getRecaptchaToken(formId) {
  const widgetId = window.__cbaRecaptchaWidgets?.[formId];

  if (!widgetId) {
    throw new Error(`No reCAPTCHA widget registered for ${formId}`);
  }

  const token = window.grecaptcha?.enterprise?.getResponse(widgetId);

  if (!token) {
    throw new Error("No reCAPTCHA token available");
  }

  return token;
}
