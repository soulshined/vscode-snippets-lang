import * as vscode from 'vscode';
import CompletionsProvider from './Providers/CompletionsProvider';
import { CodelensProvider } from './Providers/CodelensProvider';
import { InlayHintsProvider } from './Providers/InlayHintsProvider';
import { HoverProvider } from './Providers/HoverProvider';

export async function activate(context: vscode.ExtensionContext) {
    console.log('vscode-snippet-lang is now active');

    vscode.commands.registerCommand("vscode-snippet-lang.codelens", () => {
        vscode.window.showQuickPick(['Cancel', 'Yes'], {
            title: 'Disable snippets code lens',
            placeHolder: 'Cancel'
        }).then(i => {
            if ('Yes' === i) {
                vscode.workspace.getConfiguration('vscode-snippet-lang.codelens').update('enabled', false)
            }
        })
    });

    const lang_filters : vscode.DocumentFilter[] = [
        {
            language: "snippets",
        }
    ]

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(lang_filters, new CompletionsProvider),
        vscode.languages.registerCodeLensProvider(lang_filters, new CodelensProvider),
        vscode.languages.registerInlayHintsProvider(lang_filters, new InlayHintsProvider),
        vscode.languages.registerHoverProvider(lang_filters, new HoverProvider),
    );
}

export function deactivate() { }
