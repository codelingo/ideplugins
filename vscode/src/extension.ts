import { ExtensionContext, workspace, commands, window } from 'vscode';
import capture from './capture/command';
import * as git from './git';
import * as ui from './ui';

export async function activate(context: ExtensionContext): Promise<void> {
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
