import { Position, TextDocument, TextLine, window } from "vscode";
import { getLanguageService, StringASTNode, ASTNode, TextDocument as JsonTextDocument, LanguageService, JSONDocument } from "vscode-json-languageservice";
import { VARIABLES, VARIABLE_KEYS } from "./Variables";

export class JsonLSP {

    private VARIABLES_PATTERNS: RegExp[];
    private lsp: LanguageService;
    private CHOICE_PATTERN: RegExp;
    private PLACEHOLDER_PATTERN: RegExp;

    constructor() {
        this.lsp = getLanguageService({})
        this.lsp.configure({
            allowComments: true
        })

        const variables = [...VARIABLE_KEYS]
        variables.sort((a: string, b: string) => b.localeCompare(a));
        const variables_or_pattern = "(?<variable>" + variables.join("|") + ")"
        /*
        variable    ::= '$' var | '${' var '}'
        */
        this.VARIABLES_PATTERNS = [
            new RegExp(`\\$${variables_or_pattern}`, 'g'),
            new RegExp(`\\$\\{${variables_or_pattern}\\}`, 'g')
        ];
        /*
        https://code.visualstudio.com/docs/editor/userdefinedsnippets#_grammar

        choice      ::= '${' int '|' text (',' text)* '|}'
        int         ::= [0-9]+
        text        ::= .*
        */
        this.CHOICE_PATTERN = new RegExp(/\$\{[0-9]+\|(?<choices>[^\|,]+(,[^\|,]*)*)\|\}/, 'g')
        this.PLACEHOLDER_PATTERN = new RegExp(/\${[0-9]+\:(?<value>.*?)}/, 'g')
    }

    public findAndResolve(document: TextDocument): { node: StringASTNode, resolved: string, position: Position, owningTextLine: TextLine }[] {
        const parsed = this.parseDocument(document);

        const result: { node: StringASTNode, resolved: string, position: Position, owningTextLine: TextLine }[] = []
        this.walkNodes(parsed.root, (node) => {
            let value = node.value
            const position = document.positionAt(node.offset);
            const owningTextLine = document.lineAt(position)

            this.VARIABLES_PATTERNS.forEach(p => {
                for (const match of value.matchAll(p)) {
                    let variable = VARIABLES[match.groups!.variable]
                    const resolved = (variable.resolved ? variable.resolved(window.activeTextEditor!, owningTextLine) : undefined) ?? `<${match.groups!.variable}>`;
                    value = value.replace(match[0], resolved)
                }
            })

            for (const match of value.matchAll(this.CHOICE_PATTERN)) {
                let choices = match.groups!.choices.split(',')
                value = value.replace(match[0], choices[choices.length * Math.random() | 0])
            }

            for (const match of value.matchAll(this.PLACEHOLDER_PATTERN)) {
                value = value.replace(match[0], match.groups!.value);
            }

            result.push({
                node,
                resolved: value,
                position,
                owningTextLine
            })
        })

        return result;
    }

    public isPositionInValidNode(document : TextDocument, position: Position) : boolean {
        const parsed = this.parseDocument(document);
        return this.isValidNode(parsed.getNodeFromOffset(document.offsetAt(position)));
    }

    private walkNodes(root: ASTNode | undefined, fn: (node: StringASTNode) => void) {
        root?.children?.forEach(node => {
            if (node.type !== 'string') {
                this.walkNodes(node, fn);
                return
            }

            if (this.isValidNode(node)) fn(node)
        })
    }

    private isValidNode(node: ASTNode | undefined): boolean {
        if (node === undefined || node.type !== 'string') return false;

        if (node.parent?.type === 'property') {
            return node.parent.keyNode.value.toLowerCase() === 'body' &&
                node.value.trim().toLowerCase() !== 'body'
        }

        return node.parent?.type === 'array';
    }

    private parseDocument(document: TextDocument) : JSONDocument {
        return this.lsp.parseJSONDocument(
            JsonTextDocument.create(
                document.uri.toString(),
                document.languageId,
                document.version,
                document.getText()
            )
        );
    }

}
