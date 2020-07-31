import config from '../config';
import { ProgressLocation, window } from 'vscode';
import { CaptureSource, LineRange, Repo, Rule } from './model';
import * as git from '../git';
import * as ui from '../ui';
import axios from 'axios';
import { Commit } from '../@types/git';
import Auth from '../auth';

export default async function capture(): Promise<any> {
  const auth = Auth.getInstance();
  if (!auth.accessToken) {
    const ok = await ui.loginConfirmation();
    if (!ok) {
      return ui.errorNotLoggedIn();
    }
    return await auth.authenticate();
  }

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

  const source: CaptureSource = { owner: repo.owner, repo: repo.name, filepath, lineRange, commit };
  const rule = await storeRule(message, source, auth.accessToken)
    .then((response) => {
      const rule = response.data;
      return {
        id: rule.id,
        name: rule.content.name,
        description: rule.content.description,
        review_comment: rule.content.review_comment,
        query: rule.content.query,
      } as Rule;
    })
    // TODO better error handling
    .catch(async (error) => {
      await ui.errorAPIServer(error);
      return undefined;
    });

  if (!rule) {
    return;
  }

  return await ui.showRuleWasCreated(rule, source);
}

async function storeRule(message: string, source: CaptureSource, token: string | undefined) {
  return await window.withProgress(
    {
      location: ProgressLocation.Window,
      cancellable: false,
      title: 'Saving Rule...',
    },
    async () => {
      const api = config.api;
      return await axios({
        url: `${api.host}/${api.paths.capture}/${source.owner}/${source.repo}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          name: message,
          description: descriptionFromSource(source),
          query: '',
          functions: null,
          review_comment: '---',
        },
      });
    }
  );
}

async function inferContextFromActiveEditor(): Promise<{
  repos?: Repo[];
  filepath?: string;
  lineRange?: [number, number];
  commit?: Commit;
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

  const commit = await repo.getCommit('HEAD');

  return { repos, filepath, lineRange, commit };
}

function descriptionFromSource(source: CaptureSource) {
  return `Rule captured from lines ${source.lineRange?.[0]} to ${source.lineRange?.[1]} of ${
    source.filepath
  } in commit ${source.commit?.hash.substring(0, 7)}`;
}
