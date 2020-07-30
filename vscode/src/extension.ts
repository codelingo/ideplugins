import { ExtensionContext, workspace, commands, window, Uri, ProviderResult } from 'vscode';
import capture from './capture/command';
import * as git from './git';
import * as ui from './ui';
import * as auth0 from 'auth0-js';
import config from './config';
import { authenticate } from './auth';

const options = {
  redirectUri: config.auth.callbackUrl,
  responseType: config.auth.responseType,
  nonce: 'test',
};

const auth = new auth0.Authentication({
  domain: config.auth.domain,
  clientID: config.auth.clientId,
  scope: config.auth.scope,
  audience: config.auth.audience,
});

const authURL = auth.buildAuthorizeUrl(options);

export async function activate(context: ExtensionContext): Promise<void> {
  window.registerUriHandler({
    handleUri(uri: Uri): ProviderResult<void> {
      if (uri.path === '/authorize') {
        const queryString = require('query-string');
        const parsed = queryString.parse(uri.fragment);
        let token = parsed.access_token;
        context.workspaceState.update('access_token', token);
        window.showInformationMessage('Login Successful');
      }
    },
  });

  commands.executeCommand('setContext', 'codelingo:gitenabled', true);
  const enabled = workspace.getConfiguration('git', null).get<boolean>('enabled', true);
  if (!enabled) {
    ui.errorGitDisabled();
    return;
  }

  try {
    await git.initialise();
  } catch (ex) {
    commands.executeCommand('setContext', 'codelingo:gitenabled', false);

    if (ex.message.includes('Unable to find git')) {
      await ui.errorGitNotFound();
    }

    return;
  }

  const captureCommand = commands.registerCommand('codelingo.capture', () => {
    capture(context.workspaceState.get('access_token'));
  });
  context.subscriptions.push(captureCommand);

  if (!context.globalState.get('access_token')) {
    await window.showInformationMessage('Please log in with GitHub to continue');
    await authenticate(authURL);
  }
}

export function deactivate() {}
