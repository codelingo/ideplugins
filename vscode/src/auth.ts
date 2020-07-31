import * as vscode from 'vscode';
import config from './config';
import * as auth0 from 'auth0-js';

export default class Auth {
  private static instance: Auth;
  private _options: auth0.AuthorizeUrlOptions;
  private _auth: auth0.Authentication;
  private _accessToken: string | undefined;

  private constructor() {
    this._options = {
      redirectUri: config.auth.callbackUrl,
      responseType: config.auth.responseType,
    };

    this._auth = new auth0.Authentication({
      domain: config.auth.domain,
      clientID: config.auth.clientId,
      scope: config.auth.scope,
      audience: config.auth.audience,
    });
  }

  static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }

    return Auth.instance;
  }

  async authenticate() {
    const nonce = this.generateNonce();
    this._options.nonce = nonce;
    const url = this._auth.buildAuthorizeUrl(this._options);
    const callableUri = await vscode.env.asExternalUri(vscode.Uri.parse(url));
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

  private generateNonce(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
}
