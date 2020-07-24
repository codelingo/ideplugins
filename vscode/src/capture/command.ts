import config from '../config';
import { ProgressLocation, window } from 'vscode';
import { CaptureSource, LineRange, Repo, Rule } from './model';
import * as git from '../git';
import * as ui from '../ui';
import axios from 'axios';
import { Commit } from '../@types/git';

const defaultQuery = `# Edit this query to find problematic code.
import codelingo/ast/go
go.file(depth=any):
  @review comment
  go.ident:
    name == "impossible package name"
`;

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

  const source: CaptureSource = { owner: repo.owner, repo: repo.name, filepath, lineRange, commit };
  const rule = await storeRule(message, source);
  await ui.showRuleWasCreated(rule, source);
}

async function storeRule(message: string, source: CaptureSource) {
  return await window.withProgress(
    {
      location: ProgressLocation.Window,
      cancellable: false,
      title: 'Saving Rule...',
    },
    async () => {
      const api = config.api;
      // VSCode will generate an okay-ish error message if this request fails
      const response = await axios.post(
        `${api.host}/${api.paths.capture}/${source.owner}/${source.repo}`,
        {
          name: `Rule captured from VSCode in ${source.filepath}`,
          description: descriptionFromSource(source),
          query: defaultQuery,
          functions: null,
          review_comment: '---',
        }
      );

      const rule = response.data;
      return {
        id: rule.id,
        name: rule.content.name,
        description: rule.content.description,
        review_comment: rule.content.review_comment,
        query: rule.content.query,
      } as Rule;
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
  return `Rule captured from lines ${source.lineRange?.[0]} to ${source.lineRange?.[1]} of ${source.filepath} in commit ${source.commit?.hash}`;
}