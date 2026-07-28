const RECAPTCHA_SITE_KEY = '6LfUtmgtAAAAAAOoA4LdathmlyWycPtPUZ2HtH5JL';

export async function getRecaptchaToken(action) {
  console.log("grecaptcha =", window.grecaptcha);
  console.log("enterprise =", window.grecaptcha?.enterprise);

  if (!window.grecaptcha?.enterprise) {
    throw new Error("Enterprise library missing");
  }

  console.log("waiting for ready()");

  await new Promise((resolve) => {
    window.grecaptcha.enterprise.ready(resolve);
  });

  console.log("calling execute()");

  try {
    const token = await window.grecaptcha.enterprise.execute(
      RECAPTCHA_SITE_KEY,
      { action },
    );

    console.log("execute returned:", token);

    if (!token) {
      throw new Error("execute() returned empty token");
    }

    return token;
  } catch (err) {
    console.error("execute FAILED:", err);
    console.error("name:", err?.name);
    console.error("message:", err?.message);
    throw err;
  }
}
