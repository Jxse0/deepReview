import * as vscode from "vscode";
import ollama from "ollama";

const ANNOTATION_PROMPT = `You are a code tutor who helps students learn how to write better code. Your job is to evaluate a block of code that the user gives you and then annotate any lines that could be improved with a brief suggestion and the reason why you are making that suggestion. Only make suggestions when you feel the severity is enough that it will impact the readability and maintainability of the code. Be friendly with your suggestions and remember that these are students so they need gentle guidance. Format each suggestion as a single JSON object. It is not necessary to wrap your response in triple backticks. Here is an example of what your response should look like:

{ "line": 1, "suggestion": "I think you should use a for loop instead of a while loop. A for loop is more concise and easier to read." }{ "line": 12, "suggestion": "I think you should use a for loop instead of a while loop. A for loop is more concise and easier to read." }`;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "checkboss" is now active!');
  context.subscriptions.push(registerAnnotationCommand());
}

function registerAnnotationCommand(): vscode.Disposable {
  return vscode.commands.registerTextEditorCommand(
    "checkboss.annotate",
    async (textEditor: vscode.TextEditor) => {
      try {
        const code = getVisibleCodeWithLineNumbers(textEditor);
        const response = await getOllamaResponse(code);
        await processAnnotations(response, textEditor);
      } catch (error) {
        vscode.window.showErrorMessage(`Error fetching response: ${error}`);
      }
    }
  );
}

async function getOllamaResponse(code: string): Promise<string> {
  const response = await ollama.chat({
    model: "deepseek-r1:latest",
    messages: [
      { role: "system", content: ANNOTATION_PROMPT },
      { role: "user", content: code },
    ],
    stream: false,
  });
  return response.message.content;
}

async function processAnnotations(
  responseText: string,
  textEditor: vscode.TextEditor
) {
  const annotations = parseAnnotations(responseText);
  annotations.forEach(({ line, suggestion }) => {
    applyDecoration(textEditor, line, suggestion);
  });
}

function parseAnnotations(
  responseText: string
): Array<{ line: number; suggestion: string }> {
  const jsonMatches = responseText.match(/\{[^}]+\}/g) || [];
  return jsonMatches.reduce((acc, jsonString) => {
    try {
      acc.push(JSON.parse(jsonString));
    } catch (e) {
      console.error("Failed to parse JSON annotation:", e);
    }
    return acc;
  }, [] as Array<{ line: number; suggestion: string }>);
}

function getVisibleCodeWithLineNumbers(textEditor: vscode.TextEditor) {
  let code = "";
  textEditor.visibleRanges.forEach((range) => {
    for (let i = range.start.line; i <= range.end.line; i++) {
      code += `${i + 1}: ${textEditor.document.lineAt(i).text}\n`;
    }
  });
  return code;
}

function applyDecoration(
  editor: vscode.TextEditor,
  line: number,
  suggestion: string
) {
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: ` ${suggestion.substring(0, 25)}...`,
      color: "grey",
    },
  });

  const lineIndex = line - 1;
  const lineLength = editor.document.lineAt(lineIndex).text.length;
  const range = new vscode.Range(
    new vscode.Position(lineIndex, lineLength),
    new vscode.Position(lineIndex, lineLength)
  );

  const decoration = { range, hoverMessage: suggestion };
  vscode.window.activeTextEditor?.setDecorations(decorationType, [decoration]);
}

export function deactivate() {}
