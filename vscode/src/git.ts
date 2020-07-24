import { extensions, Extension, Uri } from 'vscode';
import { GitExtension, API, Repository } from './@types/git';
import { Repo } from './capture/model';
import path = require('path');

let api: API | undefined;

export async function initialise() {
  api = await getBuiltInGitApi();
}

export async function getBuiltInGitApi(): Promise<API | undefined> {
  try {
    const extension = extensions.getExtension('vscode.git') as Extension<GitExtension>;
    if (extension !== undefined) {
      const gitExtension = extension.isActive ? extension.exports : await extension.activate();

      return gitExtension.getAPI(1);
    }
  } catch {}

  return;
}

export async function getRepoFor(file: Uri): Promise<Repository | undefined> {
  if (!api) {
    return;
  }

  for (const repo of api.repositories) {
    if (file.fsPath.startsWith(repo.rootUri.fsPath)) {
      return repo;
    }
  }

  return;
}

const GITHUB_REMOTE_PATTERN = /github.com[/:]([^/]+)\/([^.]+)/;

export function parseRemotesAsRepos(repo: Repository): Repo[] {
  const repos: Repo[] = [];
  const remotes = repo.state.remotes;
  const currentRemote = repo.state.HEAD?.upstream?.remote;
  for (const remote of remotes) {
    const match = remote.fetchUrl?.match(GITHUB_REMOTE_PATTERN);
    if (match) {
      const [_, owner, name] = match;
      const repo: Repo = { owner, name };
      if (remote.name === currentRemote) {
        return [repo];
      }
      repos.push(repo);
    }
  }
  return repos;
}

// file uri --> repo-relative path
export function getFilePathRelativeToRepoRootPath(
  fileUri: Uri,
  repoRootUri: Uri
): string | undefined {
  const relativePath = path.relative(repoRootUri.fsPath, fileUri.fsPath).replace(/\\/g, '/');
  return relativePath;
}
