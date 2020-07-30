const config = {
  api: {
    host: 'http://localhost:8085',
    paths: {
      capture: 'capture',
    },
  },
  dash: {
    host: 'https://dash.codelingo.io',
  },
  auth: {
    domain: 'codelingo-staging.au.auth0.com',
    clientId: 'pUqeoQy1JrpJnqmanEfILAEe5gK3HyhR',
    callbackUrl: 'vscode://codelingo.codelingo/authorize',
    responseType: 'token id_token',
    scope: 'openid email profile',
    audience: 'https://flow.staging.codelingo.io',
  },
};

export default config;
