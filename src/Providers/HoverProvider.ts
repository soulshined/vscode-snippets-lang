import { CancellationToken, Hover, MarkdownString, Position, HoverProvider as Provider, ProviderResult, TextDocument } from "vscode";
import { VARIABLES, VARIABLE_KEYS } from "../Variables";

export class HoverProvider implements Provider {
    provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) return;

        const word = document.getText(range).toUpperCase();
        if (!VARIABLE_KEYS.includes(word)) return;

        const doc = VARIABLES[word];
        const md = new MarkdownString(doc.description)
        if (doc.documentation) {
            md.appendMarkdown(`\n\n${doc.documentation.value}\n\nSee also: [https://code.visualstudio.com/docs](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_variables)`)
        }

        return new Hover(md)
    }

}