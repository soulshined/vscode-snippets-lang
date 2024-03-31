import { CompletionItem, CompletionItemKind, CompletionItemProvider, SnippetString, TextDocument, Position, CancellationToken, CompletionContext } from "vscode";
import { VARIABLES } from "../Variables";
import { JsonLSP } from "../JsonLSP";

class Provider implements CompletionItemProvider {

    private variableCompletionItems: { [k in string]: CompletionItem } = {} as const;
    private jsonlsp: JsonLSP = new JsonLSP;

    constructor() {
        for (const [k, v] of Object.entries(VARIABLES)) {
            const variable: CompletionItem = {
                label: `$${k}`,
                detail: v.description,
                kind: CompletionItemKind.Variable,
                documentation: v.documentation
            }

            this.variableCompletionItems[k] = variable;
        }
    }

    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
        if (!this.jsonlsp.isPositionInValidNode(document, position)) return [];

        const wordRange = document.getWordRangeAtPosition(position, /\$\{?([a-zA-Z][_a-zA-Z0-9]*|[^a-zA-Z]?)/);
        const wordAtRange = (wordRange ? document.getText(wordRange) : "").trim();

        const completions: CompletionItem[] = [];

        if ('choice'.includes(wordAtRange)) {
            completions.push({
                label: 'choice',
                kind: CompletionItemKind.Snippet,
                insertText: new SnippetString('${${1:1}|${2:a},${3:b}|}')
            })
        }

        for (const [k, ci] of Object.entries(this.variableCompletionItems)) {
            ci.insertText = (wordAtRange.startsWith('$') ? '' : '$') + k,
            completions.push(ci);
        }

        return completions;
    }

}

export default Provider;