import * as vscode from 'vscode';
export async function authenticate(authURL: string) {
  const callableUri = await vscode.env.asExternalUri(vscode.Uri.parse(authURL));
  await vscode.env.openExternal(callableUri);
}
