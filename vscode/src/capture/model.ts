import { QuickPickItem } from 'vscode';

export type LineRange = [number, number];

export interface CaptureSource {
  owner: string | undefined;
  repo: string | undefined;
  filepath: string | undefined;
  lineRange: LineRange | undefined;
}

export interface Repo {
  owner: string;
  name: string;
}

export interface Rule {
  id: number;
  name: string;
  description: string;
}

export interface RepoQuickPickItem extends QuickPickItem {
  repo: Repo;
}
