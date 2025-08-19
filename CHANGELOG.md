# Changelog

All notable changes to kanapadadu will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multi-provider AI support (Gemini, OpenAI, Claude)
- Clean Cluely-inspired authentication UI
- Persistent settings storage with encryption
- Enhanced screenshot analysis with multiple AI providers
- Voice input and audio analysis capabilities
- Real-time chat interface with context awareness
- Global keyboard shortcuts for quick access
- Cross-platform build configuration for Mac, Windows, Linux
- Comprehensive documentation and user guides

### Changed
- Migrated from single Gemini provider to multi-provider architecture
- Improved UI/UX with modern design principles
- Enhanced error handling and user feedback
- Optimized performance for large screenshot processing

### Fixed
- API key validation and error handling
- Window management and focus issues
- Memory leaks in screenshot processing
- Cross-platform compatibility issues

### Security
- Encrypted local storage for API keys
- Secure handling of sensitive data
- No external data transmission except to selected AI providers

## [1.0.0] - 2024-01-15

### Added
- Initial release of kanapadadu
- Basic screenshot capture and analysis
- Gemini AI integration
- Electron-based desktop application
- Queue and Solutions view
- Basic keyboard shortcuts
- Audio recording and analysis
- Chat interface with AI

### Features
- Screenshot-based problem extraction
- AI-powered solution generation
- Debug assistance with additional screenshots
- Voice input for hands-free operation
- Floating window interface
- Auto-resizing based on content
- Global shortcuts for quick access

### Supported Platforms
- macOS (Intel and Apple Silicon)
- Windows (x64 and x86)
- Linux (x64)

---

## Release Notes

### v1.1.0 - Multi-Provider AI Support

This major update introduces support for multiple AI providers, giving users the flexibility to choose between Gemini, OpenAI, and Claude based on their preferences and needs.

**Key Highlights:**
- **Multiple AI Providers**: Choose from Gemini 2.0, GPT-4o, or Claude 3.5 Sonnet
- **Enhanced Authentication**: Clean, Cluely-inspired setup flow
- **Persistent Settings**: Encrypted storage for API keys and preferences
- **Improved UI**: Modern design with better accessibility

**Migration Guide:**
If you're upgrading from v1.0.0, your existing Gemini API key will be automatically migrated to the new settings system. No action required!

### v1.0.0 - Initial Release

The first stable release of kanapadadu brings AI-powered assistance to coding interviews and problem-solving sessions.

**Features:**
- Screenshot capture and AI analysis
- Voice input and transcription
- Real-time chat with Gemini AI
- Cross-platform desktop application
- Global keyboard shortcuts
- Floating window interface

---

## Version Support

| Version | Release Date | Support Status | Security Updates |
|---------|--------------|----------------|------------------|
| 1.1.x   | 2024-01-20   | ✅ Active      | ✅ Yes           |
| 1.0.x   | 2024-01-15   | ⚠️ Maintenance | ✅ Until 2024-07 |

## Upgrade Instructions

### From v1.0.x to v1.1.x

1. Download the latest version from the [releases page](https://github.com/hello-krsolutions/free-cluely/releases)
2. Close the existing application
3. Install the new version (overwrites the previous installation)
4. Launch the application - your settings will be automatically migrated
5. Optionally configure additional AI providers in Settings

### Breaking Changes

There are no breaking changes in v1.1.x. All existing functionality remains compatible.

## Known Issues

### v1.1.0
- Audio analysis is currently only supported with Gemini provider
- Some antivirus software may flag the Windows installer (false positive)
- Linux AppImage requires additional permissions for screenshot capture

### Workarounds
- For Linux screenshot issues: Run `chmod +x Interview-Coder.AppImage` and ensure X11/Wayland permissions
- For Windows antivirus: Add application to exclusions or use the portable version

## Planned Features

### v1.2.0 (Q2 2024)
- [ ] Team collaboration features
- [ ] Custom AI model support
- [ ] Enhanced debugging tools
- [ ] Performance optimizations

### v1.3.0 (Q3 2024)
- [ ] IDE integrations
- [ ] Video recording capabilities
- [ ] Cloud sync (optional)
- [ ] Mobile companion app

## Feedback and Bug Reports

We value your feedback! Please report issues or suggest features:

- **GitHub Issues**: [Report a bug](https://github.com/hello-krsolutions/free-cluely/issues/new?template=bug_report.md)
- **Feature Requests**: [Suggest a feature](https://github.com/hello-krsolutions/free-cluely/issues/new?template=feature_request.md)
- **Email Support**: [hello@krmrsolutions.com](mailto:hello@krmrsolutions.com)

---

*For detailed technical changes, see the [commit history](https://github.com/ibttf/interview-coder-frontend/commits/main).*
