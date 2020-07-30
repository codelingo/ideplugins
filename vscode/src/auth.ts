import * as vscode from 'vscode';
import config from './config';
import * as auth0 from 'auth0-js';

export default class Auth {
  private static instance: Auth;
  private _options: auth0.AuthorizeUrlOptions;
  private _auth: auth0.Authentication;
  private _authURL: string;
  private _accessToken: string | undefined;

  private constructor() {
    this._options = {
      redirectUri: config.auth.callbackUrl,
      responseType: config.auth.responseType,
      nonce: 'test',
    };

    this._auth = new auth0.Authentication({
      domain: config.auth.domain,
      clientID: config.auth.clientId,
      scope: config.auth.scope,
      audience: config.auth.audience,
    });

    this._authURL = this._auth.buildAuthorizeUrl(this._options);
  }

  static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }

    return Auth.instance;
  }

  async authenticate() {
    const callableUri = await vscode.env.asExternalUri(vscode.Uri.parse(this._authURL));
    await vscode.env.openExternal(callableUri);
  }

  set accessToken(token: string | undefined) {
    if (token === '') {
      this._accessToken = undefined;
      return;
    }
    this._accessToken = token;
  }

  get accessToken(): string | undefined {
    return this._accessToken;
  }
}
