#!/usr/bin/env node
/* Local mock LMS for AuthN MFE development (port 18000). */
const http = require('http');

const CORS = {
  'Access-Control-Allow-Origin': 'http://localhost:1999',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRFToken, Use-Jwt-Cookie, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

const mfeContext = {
  registrationFields: {
    fields: {
      first_name: {
        name: 'first_name',
        type: 'text',
        label: 'First Name',
        error_message: 'Enter your first name',
      },
      last_name: {
        name: 'last_name',
        type: 'text',
        label: 'Last Name',
        error_message: 'Enter your last name',
      },
      terms_of_service: {
        name: 'terms_of_service',
        label: 'I agree to the Terms of Service and Privacy Policy.',
        error_message: 'You must agree to the Terms of Service and Privacy Policy before creating an account.',
      },
    },
  },
  optionalFields: {
    fields: {
      country: {
        name: 'country',
        label: 'Country/Region',
        error_message: '',
      },
    },
    extended_profile: [],
  },
  contextData: {
    platformName: 'Center for Business Acceleration',
    providers: [],
    secondaryProviders: [],
    currentProvider: null,
    finishAuthUrl: null,
    pipelineUserDetails: null,
    countryCode: null,
    autoSubmitRegForm: false,
    errorMessage: null,
    welcomePageRedirectUrl: null,
    registerFormSubmitButtonText: 'Create an account for free',
  },
};

const readBody = (req) => new Promise((resolve) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});

http.createServer(async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url.split('?')[0];
  const json = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(payload));
  };

  if (url.endsWith('/login_refresh')) {
    return json(401, {});
  }
  if (url.includes('/csrf/')) {
    return json(200, { csrfToken: 'mock' });
  }
  if (url.includes('/api/mfe_context')) {
    return json(200, mfeContext);
  }
  if (url.includes('/api/user/v2/account/login_session')) {
    await readBody(req);
    return json(200, {
      success: true,
      redirect_url: 'http://localhost:18000/dashboard',
    });
  }
  if (url.includes('/api/user/v1/validation/registration')) {
    await readBody(req);
    return json(200, { validation_decisions: {}, username_suggestions: [] });
  }
  if (url.includes('/api/user/v2/account/registration') || url.includes('/user_api/v1/account/registration')) {
    await readBody(req);
    return json(200, {
      success: true,
      redirect_url: 'http://localhost:18000/dashboard',
      authenticated_user: null,
    });
  }

  return json(200, {});
}).listen(18000, '127.0.0.1', () => {
  console.log('Mock LMS :18000 (CBA registration + login + mfe_context)');
});
