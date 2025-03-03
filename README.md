# OptiSee - AI-Powered Web Accessibility Extension

OptiSee is a browser extension designed to enhance web accessibility using AI technologies. It leverages the power of Claude AI from Anthropic to analyze and simplify web content, making it more accessible to users with diverse needs.

## Features

- **Contrast Analysis**: Analyze web pages for contrast issues according to WCAG 2.2 standards.
- **Content Simplification**: Simplify web content to different reading levels using Claude AI.
- **Focus Mode**: Enhance focus by dimming distractions and highlighting important content.
- **Alt Text Generator**: AI-powered generation of descriptive alt text for images.
- **Text-to-Speech**: Convert selected text to speech with customizable playback options.

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
   pnpm install
   ```

3. Set up your API keys:
   - Open the extension's options page and enter your Claude AI API key.

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from the project

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

## Usage

### Alt Text Generator

1. Click the extension icon
2. Select "Alt Text Generator"
3. Click "Analyze Images"
4. Review and apply suggested alt text

### Contrast Analyzer

1. Navigate to the desired webpage
2. Open the extension
3. Click "Analyze Website"
4. Review contrast issues and suggestions

### Text-to-Speech

1. Select text on any webpage
2. Click the extension icon
3. Use the play button or keyboard shortcut (Ctrl/Cmd + Shift + S)
4. Control playback with play/pause button
5. Adjust voice settings if needed

## Project Structure

```src/
├── components/ # React components
├── features/ # Feature-specific hooks and logic
├── services/ # AI and other services
├── utils/ # Utility functions
└── content.ts # Content script
```

## Integration with Claude AI

The extension uses the Anthropic SDK to interact with Claude AI for:

- Generating accessible alt text for images
- Analyzing contrast ratios and suggesting improvements
- Simplifying complex text content

Ensure your API key is stored securely and is accessible by the extension.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.
