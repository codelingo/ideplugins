import { ProgressLocation, window } from 'vscode';
import { CaptureSource, LineRange, Repo, Rule } from './model';
import * as git from '../git';
import * as ui from '../ui';

export default async function capture(): Promise<any> {
  // TODO: authenticate user with auth-0
  const { repos, filepath, lineRange, commit } = await inferContextFromActiveEditor();
  if (!repos) {
    return await ui.errorNoRepoDetected();
  }

  const message = await ui.inputCaptureMessage(lineRange);
  if (!message) {
    return; // user cancelled or empty message
  }

  // TODO: check which repos are actually available for this user in codelingo
  const repo = await ui.chooseRepo(repos);
  if (!repo) {
    return await ui.errorNoRepoChosen(); // user didn't choose a repo
  }

  const source: CaptureSource = { owner: repo.owner, repo: repo.name, filepath, lineRange };
  const rule = await storeRule(message, source);
  await ui.showRuleWasCreated(rule, source);
}

async function storeRule(message: string, source: CaptureSource) {
  return await window.withProgress(
    {
      location: ProgressLocation.Window,
      cancellable: false,
      title: 'Saving rule...',
    },
    async () => {
      // TODO: store rule  here using a codelingo API
      // const rule = await axios.post(`${config.apiEndpoint}/rules/add/...`, {
      //   ...
      // });
      // ...
      //
      return {
        id: 76,
        name: '',
        description: '',
      } as Rule;
    }
  );
}

async function inferContextFromActiveEditor(): Promise<{
  repos?: Repo[];
  filepath?: string;
  lineRange?: [number, number];
}> {
  const editor = window.activeTextEditor;
  if (!editor) {
    return {};
  }

  const { start, end } = editor.selection;
  const lineRange: LineRange = [start.line + 1, end.line + 1];
  const uri = editor.document.uri;
  const repo = await git.getRepoFor(uri);
  if (!repo) {
    return { lineRange };
  }

  const repos = git.parseRemotesAsRepos(repo);
  const filepath = git.getFilePathRelativeToRepoRootPath(uri, repo.rootUri);

  return { repos, filepath, lineRange };
}
