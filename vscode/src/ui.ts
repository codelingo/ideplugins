import config from './config';
import { Rule, CaptureSource, Repo, LineRange, RepoQuickPickItem } from './capture/model';
import { window, env, Uri } from 'vscode';

export async function showRuleWasCreated(rule: Rule, source: CaptureSource) {
  const response = await window.showInformationMessage(
    `Rule #${rule.id} captured for ${source.repo}`,
    'View Rule'
  );
  if (response === 'View Rule') {
    const url = `${config.dash.host}/repos/${source.owner}/${source.repo}/rules/${rule.id}`;
    env.openExternal(Uri.parse(url));
  }
}

export async function loginConfirmation() {
  const response = await window.showInformationMessage(
    'Please log in with GitHub and run the command again',
    'Login'
  );
  return response === 'Login';
}

export async function chooseRepo(repos: Repo[]): Promise<Repo | undefined> {
  const toRepoQuickPickItem = (repo: Repo): RepoQuickPickItem => {
    const { owner, name } = repo;
    return {
      label: `${owner}/${name}`,
      repo: repo,
    };
  };

  if (repos) {
    if (repos.length === 1) {
      return repos[0];
    } else if (repos.length > 1) {
      const item = await window.showQuickPick(repos.map(toRepoQuickPickItem), {
        canPickMany: false,
      });
      return item?.repo;
    }
  }

  return undefined;
}

export async function inputCaptureMessage(lineRange: LineRange | undefined) {
  function describeLineRange(lineRange: LineRange | undefined) {
    if (!lineRange) {
      return '';
    }

    const [start, end] = lineRange;
    return start === end ? `line ${start}` : `lines ${start}-${end}`;
  }

  const result = await window.showInputBox({
    placeHolder: 'Enter a message to capture',
    prompt: `What Rule do you want to capture at ${describeLineRange(lineRange)}?`,
  });

  return result?.trim();
}

export async function errorNoRepoChosen() {
  await window.showErrorMessage('No repo was chosen for this capture');
}

export async function errorNoRepoDetected() {
  await window.showErrorMessage('Could not detect which GitHub repo this file belongs to');
}

export async function errorRepoNotFound() {
  await window.showErrorMessage(
    `CodeLingo was unable to find your repo. Please make sure the CodeLingo GitHub app is installed
    on the repo.`
  );
}

export async function errorAPIServer(message: string) {
  await window.showErrorMessage(
    `API Error: ${message}. Please make sure you have the CodeLingo GitHub app installed on this repo.`
  );
}

export async function errorClient() {
  await window.showErrorMessage('CodeLingo capture hit an error');
}

export async function errorGitDisabled() {
  await window.showInformationMessage(
    'CodeLingo requires Git to be enabled. Please re-enable Git \u2014 set `git.enabled` to true and reload'
  );
}

export async function errorGitNotFound() {
  await window.showErrorMessage(
    'CodeLingo was unable to find Git. Please make sure Git is installed. Also ensure that Git is in the PATH.'
  );
}

export async function errorNotLoggedIn() {
  await window.showErrorMessage('CodeLingo Capture requires login to use.');
}
