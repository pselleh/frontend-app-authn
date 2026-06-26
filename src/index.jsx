import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { StrictMode } from 'react';

import {
  APP_INIT_ERROR,
  APP_READY,
  getConfig,
  initialize,
  mergeConfig,
  subscribe,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import { createRoot } from 'react-dom/client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import configuration from './config';
import messages from './i18n';
import MainApp from './MainApp';

subscribe(APP_READY, () => {
  const root = createRoot(document.getElementById('root'));

  const app = <MainApp />;
  const recaptchaSiteKey = getConfig().RECAPTCHA_SITE_KEY;

  root.render(
    <StrictMode>
      {recaptchaSiteKey ? (
        <GoogleReCaptchaProvider
          reCaptchaKey={recaptchaSiteKey}
          scriptProps={{
            async: true,
            defer: true,
          }}
        >
          {app}
        </GoogleReCaptchaProvider>
      ) : (
        app
      )}
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  const root = createRoot(document.getElementById('root'));

  root.render(
    <StrictMode>
      <ErrorPage message={error.message} />
    </StrictMode>,
  );
});

initialize({
  handlers: {
    config: () => {
      mergeConfig(configuration);
    },
  },
  messages,
});
