# CheckBoss - VS Code Extension

## Introduction
CheckBoss is a Visual Studio Code extension that automatically analyzes code and provides improvement suggestions directly in the editor. It uses Ollama with the DeepSeek-R1 model to generate intelligent annotations.

## Installation
### 1. Install Ollama
Ensure that Ollama is installed and that the `deepseek-r1` model is available. If not, install it using:

[Download DeepSeek-R1](https://ollama.com/library/deepseek-r1)

### 2. Create the VS Code Extension
Use Yeoman to generate a standard extension:
```sh
npx --package yo --package generator-code -- yo code
```
Select the default options.

### 3. Install Dependencies
Install all necessary packages with:
```sh
pnpm install
pnpm install ollama
```

## Debugging
To debug the extension:
1. Open the project in Visual Studio Code.
2. Click on `Debug Start` or press `F5`.
3. A new VS Code window will open with the extension installed.
4. In the top right corner, next to the run symbol, you will see an Comment bubble icon – click it to start the extension.
5. Depending on your hardware, it may take some time to begin analysis.

## License
MIT License

