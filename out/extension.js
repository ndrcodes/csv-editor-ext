"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    let panel;
    let disposable = vscode.commands.registerCommand('csv-editor.showCSV', () => {
        if (!panel) {
            panel = vscode.window.createWebviewPanel('csvEditor', 'CSV Editor', vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [context.extensionUri],
            });
            panel.webview.html = getWebviewContent(context.extensionUri);
            panel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'download':
                        const data = message.data;
                        const filename = message.filename;
                        if (vscode.workspace.workspaceFolders) {
                            const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
                            const filePath = path.join(workspaceFolder, filename);
                            fs.writeFile(filePath, data, { flag: 'wx' }, (err) => {
                                if (err) {
                                    vscode.window.showErrorMessage(`Error saving file: ${err.message}`);
                                }
                                else {
                                    vscode.window.showInformationMessage(`File saved to ${filePath}`);
                                }
                            });
                        }
                        else {
                            vscode.window.showErrorMessage("Please open a folder to save the file.");
                        }
                        return;
                    case 'error':
                        vscode.window.showErrorMessage(message.data);
                        return;
                }
            }, undefined, context.subscriptions);
            panel.onDidDispose(() => {
                panel = undefined;
            }, null, context.subscriptions);
        }
        else {
            panel.reveal();
        }
    });
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
function getWebviewContent(url) {
    const htmlFile = vscode.Uri.joinPath(url, 'webview', 'editor.html');
    const html = fs.readFileSync(htmlFile.fsPath, 'utf8');
    return html;
}
//# sourceMappingURL=extension.js.map