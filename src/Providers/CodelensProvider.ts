import { CodeLens, Event, EventEmitter, CodeLensProvider as Provider, TextDocument, CancellationToken, workspace, Range } from 'vscode';
import { JsonLSP } from '../JsonLSP';

export class CodelensProvider implements Provider {

    private codeLenses: CodeLens[] = [];
    private jsonlsp: JsonLSP = new JsonLSP;
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        this.codeLenses = [];

        if (!workspace.getConfiguration("vscode-snippet-lang").get("codelens.enabled", true))
            return this.codeLenses;

        this.jsonlsp.findAndResolve(document).forEach(match => {
            this.codeLenses.push({
                isResolved: true,
                range: new Range(match.position, match.position),
                command: {
                    title: match.resolved,
                    command: "vscode-snippet-lang.codelens"
                }
            })
        })

        return this.codeLenses;
    }

}
