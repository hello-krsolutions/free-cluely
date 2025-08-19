# kanapadadu

<div align="center">

![kanapadadu Logo](https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=AI)

**AI-Powered Coding Interview Assistant**

*Your intelligent companion for coding interviews and problem-solving*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)](https://github.com/hello-krsolutions/free-cluely/releases)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-33%2B-47848F)](https://electronjs.org/)

[Download](#installation) • [Documentation](#documentation) • [Features](#features) • [Development](#development)

</div>

## Overview

kanapadadu is a powerful desktop application designed to assist developers during coding interviews and problem-solving sessions. It combines cutting-edge AI capabilities with an intuitive interface to provide real-time assistance, screenshot analysis, and intelligent conversation.

### 🎯 Key Features

- **🔍 Screenshot Analysis**: Capture and analyze problem statements with AI vision
- **🤖 Multiple AI Providers**: Support for Gemini, OpenAI, and Claude
- **🎤 Voice Input**: Record and analyze audio for hands-free interaction
- **💬 Real-time Chat**: Instant AI assistance with context awareness
- **⚡ Global Shortcuts**: Quick access with customizable keyboard shortcuts
- **🔒 Secure Storage**: Encrypted API key management
- **🌐 Cross-Platform**: Native apps for macOS, Windows, and Linux

## Installation

### Download Pre-built Applications

Visit our [Releases Page](https://github.com/hello-krsolutions/free-cluely/releases) to download the latest version:

- **macOS**: Download `Interview-Coder-{version}.dmg`
- **Windows**: Download `Interview-Coder-Setup-{version}.exe`
- **Linux**: Download `Interview-Coder-{version}.AppImage`

### System Requirements

- **macOS**: 10.14 Mojave or later (Intel/Apple Silicon)
- **Windows**: Windows 10 version 1809 or later (x64/x86)
- **Linux**: Ubuntu 18.04+ / equivalent (x64)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB available space

## Quick Start

### 1. First Launch

When you first open kanapadadu, you'll be greeted with a welcome screen:

1. Click **"Get Started"** to begin setup
2. Choose your preferred AI provider (Gemini, OpenAI, or Claude)
3. Enter your API key and validate the connection
4. Start using the application!

### 2. Getting API Keys

You'll need an API key from at least one AI provider:

- **Google Gemini**: [Get API Key](https://makersuite.google.com/app/apikey) (Recommended for vision/audio features)
- **OpenAI**: [Get API Key](https://platform.openai.com/api-keys)
- **Anthropic Claude**: [Get API Key](https://console.anthropic.com/)

### 3. Basic Usage

1. **Take Screenshots**: Press `Cmd+H` (Mac) or `Ctrl+H` (Windows/Linux)
2. **Chat with AI**: Click the 💬 Chat button for real-time assistance
3. **Voice Input**: Use the 🎤 Record button for audio analysis
4. **Settings**: Click ⚙️ Settings to configure providers and preferences

## Features

### 🖼️ Screenshot Analysis

Automatically capture and analyze problem statements, code snippets, or error messages:

- Instant problem extraction and context analysis
- Support for handwritten and digital text
- Code syntax recognition and analysis
- Error message interpretation

### 🤖 Multi-Provider AI Support

Choose from leading AI providers based on your needs:

| Provider | Vision | Audio | Strengths |
|----------|--------|-------|-----------|
| **Gemini 2.0** | ✅ | ✅ | Multimodal, fast responses, excellent for coding |
| **GPT-4o** | ✅ | ❌ | Advanced reasoning, comprehensive knowledge |
| **Claude 3.5** | ✅ | ❌ | Safety-focused, great for code review |

### ⌨️ Global Shortcuts

Access kanapadadu from anywhere with global shortcuts:

- `Cmd+H` / `Ctrl+H`: Take screenshot
- `Cmd+B` / `Ctrl+B`: Toggle window visibility
- `Cmd+Shift+Space` / `Ctrl+Shift+Space`: Show and center window
- `Cmd+Enter` / `Ctrl+Enter`: Process screenshots/generate solution
- `Cmd+R` / `Ctrl+R`: Reset session

### 🎤 Voice Features

Hands-free interaction with voice recording:

- Record questions or problems verbally
- AI transcription and analysis
- Perfect for complex problem descriptions
- Supports multiple audio formats

### 💬 Real-time Chat

Intelligent conversation with context awareness:

- Maintains conversation history
- Screenshot context integration
- Code explanation and debugging
- Step-by-step problem solving

## Documentation

### User Guides

- [Getting Started Guide](docs/getting-started.md)
- [AI Provider Setup](docs/ai-providers.md)
- [Keyboard Shortcuts](docs/shortcuts.md)
- [Troubleshooting](docs/troubleshooting.md)

### Development

- [Development Setup](docs/development.md)
- [Building from Source](BUILD.md)
- [API Reference](docs/api.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## Development

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+ (for native dependencies)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/hello-krsolutions/free-cluely.git
cd free-cluely

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# In another terminal, start Electron
pnpm run app:dev
```

### Project Structure

```
kanapadadu/
├── src/                    # React frontend source
│   ├── _pages/            # Main application pages
│   ├── components/        # Reusable UI components
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
├── electron/              # Electron main process
│   ├── main.ts           # Application entry point
│   ├── AIProviderManager.ts # AI provider abstraction
│   ├── SettingsManager.ts   # Configuration management
│   └── helpers/          # Various helper modules
├── assets/               # Build assets and icons
└── docs/                # Documentation files
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Electron 33, Node.js
- **AI SDKs**: Google Generative AI, OpenAI, Anthropic
- **Build**: Vite, electron-builder
- **UI Components**: Radix UI, Lucide Icons

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development
NODE_ENV=development
VITE_DEV_PORT=5173

# Legacy support (migrated to settings UI)
GEMINI_API_KEY=your_api_key_here
```

### Settings Location

Settings are stored in platform-specific locations:

- **macOS**: `~/Library/Application Support/kanapadadu/settings.json`
- **Windows**: `%APPDATA%/kanapadadu/settings.json`
- **Linux**: `~/.config/kanapadadu/settings.json`

## Privacy & Security

- **API Keys**: Stored locally and encrypted
- **Data**: No data sent to external servers except AI providers
- **Screenshots**: Stored locally and automatically cleaned up
- **Audio**: Processed locally, only sent to AI providers when needed

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 [Report bugs](https://github.com/hello-krsolutions/free-cluely/issues)
- 💡 [Suggest features](https://github.com/hello-krsolutions/free-cluely/issues)
- 🔧 [Submit pull requests](https://github.com/hello-krsolutions/free-cluely/pulls)
- 📖 [Improve documentation](https://github.com/hello-krsolutions/free-cluely/tree/main/docs)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

**KRMR Solutions Private Limited**

📍 **Address**: #501, Rebello Enclave, Subash Nagar, MIDC, Andheri E, Mumbai 400093, IN
📞 **Phone**: +91 96992 21355
📧 **Email**: [hello@krmrsolutions.com](mailto:hello@krmrsolutions.com)

**Development Support:**
- 🐛 **Issues**: [GitHub Issues](https://github.com/hello-krsolutions/free-cluely/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/hello-krsolutions/free-cluely/discussions)

## Roadmap

### Coming Soon

- [ ] **Team Collaboration**: Share sessions with teammates
- [ ] **Custom Models**: Support for local AI models
- [ ] **Plugin System**: Extensible architecture for custom features
- [ ] **Cloud Sync**: Optional cloud backup and sync
- [ ] **Mobile App**: Companion app for iOS/Android

### Future Features

- [ ] **IDE Integration**: VS Code, IntelliJ, and other IDE plugins
- [ ] **Video Recording**: Record and analyze coding sessions
- [ ] **Performance Analytics**: Track improvement over time
- [ ] **Whiteboard Mode**: Digital whiteboard for system design

---

<div align="center">

**Built with ❤️ for the developer community**

[⭐ Star us on GitHub](https://github.com/hello-krsolutions/free-cluely) • [🚀 Download Now](#installation) • [📖 Read the Docs](#documentation)

</div>
