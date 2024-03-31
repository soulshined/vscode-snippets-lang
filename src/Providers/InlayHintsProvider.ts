import { CancellationToken, Event, InlayHint, InlayHintKind, InlayHintsProvider as Provider, ProviderResult, Range, TextDocument, EventEmitter, workspace, window } from "vscode";
import { JsonLSP } from "../JsonLSP";

export class InlayHintsProvider implements Provider {
    private hints: InlayHint[] = [];
    private jsonlsp: JsonLSP = new JsonLSP;
    private _onDidChangeInlayHints: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeInlayHints: Event<void> = this._onDidChangeInlayHints.event;

    constructor() {
        workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeInlayHints.fire();
        });
    }

    provideInlayHints(document: TextDocument, range: Range, token: CancellationToken): ProviderResult<InlayHint[]> {
        this.hints = [];

        if (!workspace.getConfiguration("vscode-snippet-lang").get("inlayhints.enabled", true))
            return this.hints;

        this.jsonlsp.findAndResolve(document).forEach(match => {
            this.hints.push({
                label: match.resolved,
                tooltip: match.resolved,
                paddingLeft: true,
                kind: InlayHintKind.Type,
                position: match.owningTextLine.range.end
            });
        })

        return this.hints;
    }

    resolveInlayHint?(hint: InlayHint, token: CancellationToken): ProviderResult<InlayHint> {
        throw new Error("Method not implemented.");
    }
}
