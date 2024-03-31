import { randomUUID } from "crypto";
import path = require("path");
import { MarkdownString, TextEditor, TextLine, workspace } from "vscode";
// resolving is based on this commit https://github.com/microsoft/vscode/blob/e4595ad3998a436bbf68d32a6c59e9d49fc63e32/src/vs/editor/contrib/snippet/browser/snippetVariables.ts

interface VariableDoc {
    description: string;
    resolved?: (editor: TextEditor, owningTextLine: TextLine) => string | undefined;
    documentation?: MarkdownString;
}

const VARIABLES: { [k: string]: VariableDoc } = {

    BLOCK_COMMENT_END: {
        description: "Inserting block comment end snytax (honoring current language)",
        documentation: new MarkdownString(`
Examples

- php: \`*/\`
- html: \`-->\``)
    },
    BLOCK_COMMENT_START: {
        description: "Inserting block comment start snytax (honoring current language)",
        documentation: new MarkdownString(`
Examples

- php: \`/*\`
- html: \`<!--\``)
    },
    CLIPBOARD: {
        description: "The contents of your clipboard"
    },
    CURRENT_DATE: {
        description: "The day of the month as two digits",
        documentation: new MarkdownString(`
Examples

- 08
- 31`),
        resolved: () => new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(new Date)
    },
    CURRENT_DAY_NAME: {
        description: "The name of day",
        documentation: new MarkdownString(`
Examples

- Monday
- Wednesday
- Friday`),
        resolved: () => new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date)
    },
    CURRENT_DAY_NAME_SHORT: {
        description: "The short name of the day",
        documentation: new MarkdownString(`
Examples

- Mon
- Wed
- Fri`),
        resolved: () => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date)
    },
    CURRENT_HOUR: {
        description: "The current hour in 24-hour clock format",
        documentation: new MarkdownString(`
Examples

- 09
- 13
- 23`),
        resolved: () => new Intl.DateTimeFormat(undefined, { hourCycle: 'h23', hour: '2-digit' }).format(new Date)
    },
    CURRENT_MINUTE: {
        description: "The current minute as two digits",
        documentation: new MarkdownString(`
Examples

- 09
- 23`),
        resolved: () => new Intl.DateTimeFormat(undefined, { minute: '2-digit' }).format(new Date)
    },
    CURRENT_MONTH: {
        description: "The month as two digits",
        documentation: new MarkdownString(`
Examples

- 01
- 12`),
        resolved: () => new Intl.DateTimeFormat(undefined, { month: '2-digit' }).format(new Date)
    },
    CURRENT_MONTH_NAME: {
        description: "The full name of the month",
        documentation: new MarkdownString(`
Examples

- July
- November
- September`),
        resolved: () => new Intl.DateTimeFormat(undefined, { month: 'long' }).format(new Date)
    },
    CURRENT_MONTH_NAME_SHORT: {
        description: "The short name of the month",
        documentation: new MarkdownString(`
Examples

- Jul
- Dec
- Feb`),
        resolved: () => new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date)
    },
    CURRENT_SECOND: {
        description: "The current second as two digits",
        documentation: new MarkdownString(`
Examples

- 09
- 43`),
        resolved: () => new Intl.DateTimeFormat(undefined, { second: '2-digit' }).format(new Date)
    },
    CURRENT_SECONDS_UNIX: {
        description: "The number of seconds since the Unix epoch",
        documentation: new MarkdownString(`
Examples

- 1711861543
- 1711861697`),
        resolved: () => Date.now().toString()
    },
    CURRENT_TIMEZONE_OFFSET: {
        description: "The current UTC time zone offset",
        documentation: new MarkdownString(`
Offset is displayed as \`+HH:MM\` or \`-HH:MM\`

Examples

- -05:00
- -07:00`),
        resolved: () => new Intl.DateTimeFormat(undefined, { timeZoneName: 'longOffset' }).formatToParts(new Date)
            .filter(i => i.type === 'timeZoneName')
            .map(i => i.value).toString().replaceAll(/[^\-\+\:0-9]/g, '')
    },
    CURRENT_YEAR: {
        description: "The current year",
        documentation: new MarkdownString(`
Examples

- 2023
- 2024
- 2025`),
        resolved: () => new Intl.DateTimeFormat(undefined, { year: "numeric" }).format(new Date)
    },
    CURRENT_YEAR_SHORT: {
        description: "The current year's last two digits",
        documentation: new MarkdownString(`
Examples

- 23
- 24
- 25`),
        resolved: () => new Intl.DateTimeFormat(undefined, { year: "2-digit" }).format(new Date)
    },
    CURSOR_INDEX: {
        description: "The zero-index based cursor number",
        resolved: (editor: TextEditor) => {
            return (
                editor
                    ? editor.document.offsetAt(editor.selection.active).toString()
                    : 0
            ).toString()
        }
    },
    CURSOR_NUMBER: {
        description: "The one-index based cursor number",
        resolved: (editor: TextEditor) => {
            return (
                editor
                    ? (editor.document.offsetAt(editor.selection.active) + 1).toString()
                    : 1
            ).toString()
        }
    },
    LINE_COMMENT: {
        description: "Inserting line comment (honoring current language)",
        documentation: new MarkdownString(`
Examples

- php: \`//\``)
    },
    RANDOM: {
        description: "6 random Base-10 digits",
        documentation: new MarkdownString(`
Examples

- 003185
- 390289`),
        resolved: () => Math.random().toString().slice(-6)
    },
    RANDOM_HEX: {
        description: "6 random Base-16 digits",
        documentation: new MarkdownString(`
Examples

- 0e37c7
- 5f29bc`),
        resolved: () => Math.random().toString(16).slice(-6)
    },
    RELATIVE_FILEPATH: {
        description: "The relative (to the opened workspace or folder) file path of the current document",
        resolved: (editor: TextEditor) => {
            return editor
                ? workspace.asRelativePath(editor.document.fileName)
                : './vscode/global.code-snippets'
        }
    },
    TM_CURRENT_LINE: {
        description: "The contents of the current line",
        resolved: (_: TextEditor, owningTextLine: TextLine) => owningTextLine.text.trim()
    },
    TM_CURRENT_WORD: {
        description: "The contents of the word under cursor or an empty string",
    },
    TM_DIRECTORY: {
        description: "The directory of the current document",
        resolved: (editor: TextEditor) => {
            const dirname = path.dirname(editor.document.uri.fsPath);
            if (dirname === '.') {
                return '';
            }

            return dirname;
        }
    },
    TM_FILENAME: {
        description: "The filename of the current document",
        resolved: (editor: TextEditor) => path.basename(editor.document.uri.fsPath)
    },
    TM_FILENAME_BASE: {
        description: "The filename of the current document without its extensions",
        resolved: (editor: TextEditor) => {
            const name = path.basename(editor.document.uri.fsPath);
            const idx = name.lastIndexOf('.');
            if (idx <= 0) {
                return name;
            } else {
                return name.slice(0, idx);
            }
        }
    },
    TM_FILEPATH: {
        description: "The full file path of the current document",
        resolved: (editor: TextEditor) => editor.document.uri.fsPath
    },
    TM_LINE_INDEX: {
        description: "The zero-index based line number",
        resolved: (_: TextEditor, owningTextLine: TextLine) => owningTextLine.lineNumber.toString()
    },
    TM_LINE_NUMBER: {
        description: "The one-index based line number",
        resolved: (_: TextEditor, owningTextLine: TextLine) => (owningTextLine.lineNumber + 1).toString()
    },
    TM_SELECTED_TEXT: {
        description: "The currently selected text or the empty string",
    },
    UUID: {
        description: "A Version 4 UUID",
        documentation: new MarkdownString(`
Examples

- f1bb1b08-915d-4c2f-baac-badae583d2c1
- 0cf7a8cb-2ba0-46b8-9ae2-fc2a5f0da0c1`),
        resolved: () => randomUUID()
    },
    WORKSPACE_NAME: {
        description: "The name of the opened workspace or folder",
        resolved: () => workspace.name
    },
    WORKSPACE_FOLDER: {
        description: "The path of the opened workspace or folder",
        resolved: (editor: TextEditor) => workspace.getWorkspaceFolder(editor.document.uri)?.uri.fsPath.toString()
    },
};

const VARIABLE_KEYS = Object.keys(VARIABLES);

export {
    VariableDoc,
    VARIABLES,
    VARIABLE_KEYS
}