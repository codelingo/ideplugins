const config = {
  api: {
    host: 'https://api.codelingo.io',
    paths: {
      capture: 'capture',
    },
  },
  dash: {
    host: 'https://dash.codelingo.io',
  },
  auth: {
    domain: 'codelingo.au.auth0.com',
    clientId: 'GcFxVITN0O8ZJn82C9zJ8uuz8e63kUPz',
    callbackUrl: 'vscode://codelingo.codelingo/authorize',
    responseType: 'token id_token',
    scope: 'openid email profile',
    audience: 'https://flow.codelingo.io',
  },
};

export default config;
