# OptiSee - AI-Powered Web Accessibility Extension

OptiSee is a browser extension designed to enhance web accessibility using AI technologies. It leverages the power of Claude AI from Anthropic to analyze and simplify web content, making it more accessible to users with diverse needs.

## Features

- **Contrast Analysis**: Analyze web pages for contrast issues according to WCAG 2.2 standards.
- **Content Simplification**: Simplify web content to different reading levels using Claude AI.
- **Focus Mode**: Enhance focus by dimming distractions and highlighting important content.

## Setup

### Prerequisites

- Node.js and npm installed on your machine.
- A valid API key for Claude AI from Anthropic.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/opti-see.git
   cd opti-see
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your API keys:
   - Open the extension's options page and enter your Claude AI API key.

### Development

To start the development server, run:

```bash
pnpm dev
# or
npm run dev
```

### Building

To build the extension for production, run:

```bash
pnpm build
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

## Usage

- **Toggle Toolbar**: Use the popup to toggle the accessibility toolbar on any webpage.
- **Activate Features**: Use the toolbar to activate features like contrast analysis and content simplification.

## Integration with Claude AI

The extension uses the Anthropic SDK to interact with Claude AI. Ensure your API key is stored securely and is accessible by the extension.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.
