import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined;

	let disposable = vscode.commands.registerCommand('csv-editor.showCSV', () => {
		if (!panel) {
			panel = vscode.window.createWebviewPanel(
				'csvEditor',
				'CSV Editor',
				vscode.ViewColumn.Beside,
				{
					enableScripts: true,
					localResourceRoots: [context.extensionUri],
					retainContextWhenHidden: true
				}
			);

			panel.webview.html = getWebviewContent(context.extensionUri);

			panel.webview.onDidReceiveMessage(
				message => {
					switch (message.command) {
						case 'download':
							const data: string = message.data;
							const filename: string = message.filename;

							if (vscode.workspace.workspaceFolders) {
								const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
								const filePath = path.join(workspaceFolder, filename);

								fs.writeFile(filePath, data, { flag: 'wx' }, (err) => {
									if (err) {
										vscode.window.showErrorMessage(`Error saving file: ${err.message}`);
									} else {
										vscode.window.showInformationMessage(`File saved to ${filePath}`);
									}
								});
							} else {
								vscode.window.showErrorMessage("Please open a folder to save the file.");
							}
							return;
						case 'error':
							vscode.window.showErrorMessage(message.data);
							return;
					}
				},
				undefined,
				context.subscriptions
			);

			panel.onDidDispose(
				() => {
					panel = undefined;
				},
				null,
				context.subscriptions
			);
		} else {
			panel.reveal();
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function getWebviewContent(url: vscode.Uri): string {
	const htmlFile = vscode.Uri.joinPath(url, 'webview', 'editor.html');
	const html = fs.readFileSync(htmlFile.fsPath, 'utf8');
	return html;
}