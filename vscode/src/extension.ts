import { ExtensionContext, workspace, commands, window, Uri, ProviderResult } from 'vscode';
import capture from './capture/command';
import * as git from './git';
import * as ui from './ui';
import Auth from './auth';

export async function activate(context: ExtensionContext): Promise<void> {
  window.registerUriHandler({
    handleUri(uri: Uri): ProviderResult<void> {
      if (uri.path === '/authorize') {
        const queryString = require('query-string');
        const parsed = queryString.parse(uri.fragment);
        let token = parsed.access_token;
        if (!token) {
          window.showInformationMessage('Login Failed');
          return;
        }

        const auth = Auth.getInstance();
        auth.accessToken = token;
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

  const captureCommand = commands.registerCommand('codelingo.capture', capture);
  context.subscriptions.push(captureCommand);
}

export function deactivate() {}
