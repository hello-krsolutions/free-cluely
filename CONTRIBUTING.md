# Contributing to kanapadadu

First off, thank you for considering contributing to kanapadadu! It's people like you that make kanapadadu such a great tool for the developer community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [hello@krmrsolutions.com](mailto:hello@krmrsolutions.com).

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Getting Started

### Ways to Contribute

There are many ways to contribute to kanapadadu:

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new features or improvements
- 🔧 **Code Contributions**: Fix bugs or implement new features
- 📖 **Documentation**: Improve or add documentation
- 🎨 **Design**: Contribute to UI/UX improvements
- 🧪 **Testing**: Help test new features and report issues
- 🌐 **Translations**: Help make the app accessible in more languages

### Good First Issues

Look for issues labeled `good first issue` to get started. These are typically:
- Small, well-defined tasks
- Don't require deep knowledge of the codebase
- Have clear acceptance criteria
- Include guidance for implementation

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check if the issue already exists. When creating a bug report, include:

- **Clear title and description**
- **Exact steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, version, etc.)
- **Error messages or logs**

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Features

Feature requests are welcome! Before submitting:

- Check if the feature already exists or is planned
- Clearly describe the use case and benefits
- Consider implementation complexity
- Provide mockups or examples if helpful

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test your changes**
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Python 3.8+ (for native dependencies)
- Git

### Environment Setup

1. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/interview-coder-frontend.git
   cd interview-coder-frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys for testing
   ```

4. **Start development servers**:
   ```bash
   # Terminal 1: Start Vite dev server
   pnpm run dev

   # Terminal 2: Start Electron app
   pnpm run app:dev
   ```

### Project Structure

```
interview-coder/
├── src/                    # React frontend
│   ├── _pages/            # Main application pages
│   ├── components/        # Reusable UI components
│   ├── types/            # TypeScript definitions
│   └── lib/              # Utilities
├── electron/              # Electron main process
│   ├── main.ts           # Entry point
│   ├── AIProviderManager.ts # AI abstraction
│   └── helpers/          # Helper modules
├── assets/               # Build assets
├── docs/                # Documentation
└── tests/               # Test files
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project conventions
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear
- [ ] Branch is up-to-date with main

### PR Guidelines

1. **Title**: Use clear, descriptive titles
   - ✅ `feat: add Claude AI provider support`
   - ❌ `fix stuff`

2. **Description**: Include:
   - What changed and why
   - How to test the changes
   - Screenshots (for UI changes)
   - Related issues

3. **Size**: Keep PRs focused and reasonably sized
   - Prefer multiple small PRs over one large PR
   - Split unrelated changes into separate PRs

4. **Testing**: Ensure your changes work across platforms

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. Address feedback promptly
4. Keep PR updated with main branch

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for object shapes

### React Components

```typescript
// Preferred component structure
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Component logic
  return (
    <div className="component-class">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic class names for custom CSS

### File Naming

- Use PascalCase for React components: `SettingsPage.tsx`
- Use camelCase for utilities: `apiHelper.ts`
- Use kebab-case for assets: `app-icon.png`

### Git Conventions

Use [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or modify tests
chore: maintenance tasks
```

Examples:
- `feat(ai): add Claude provider support`
- `fix(ui): resolve settings modal overlay issue`
- `docs(readme): update installation instructions`

## Testing

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test specific file
pnpm test ComponentName
```

### Writing Tests

- Write tests for new features and bug fixes
- Use Jest for unit tests
- Use Playwright for E2E tests
- Aim for meaningful test coverage

### Test Structure

```typescript
// src/components/__tests__/Component.test.tsx
import { render, screen } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Documentation

### Code Documentation

- Use JSDoc for functions and classes
- Document complex business logic
- Keep comments up-to-date with code changes

```typescript
/**
 * Validates an API key for the specified provider
 * @param provider - The AI provider (gemini, openai, claude)
 * @param apiKey - The API key to validate
 * @returns Promise resolving to validation result
 */
async function validateApiKey(provider: string, apiKey: string): Promise<boolean> {
  // Implementation
}
```

### User Documentation

- Update README for significant changes
- Add new features to documentation
- Include screenshots for UI changes
- Keep installation instructions current

## Community

### Getting Help

- **Discord**: [Join our community](https://discord.gg/interview-coder)
- **GitHub Discussions**: [Ask questions](https://github.com/ibttf/interview-coder-frontend/discussions)
- **Email**: [dev@interviewcoder.com](mailto:dev@interviewcoder.com)

### Staying Updated

- Watch the repository for notifications
- Follow our [blog](https://blog.interviewcoder.com) for updates
- Join our [newsletter](https://newsletter.interviewcoder.com)

## Recognition

Contributors are recognized in several ways:

- Listed in CONTRIBUTORS.md
- Featured in release notes for major contributions
- Invited to maintainer team for sustained contributions
- Swag and recognition for significant contributions

## Questions?

Don't hesitate to ask questions! We're here to help:

- Open a [Discussion](https://github.com/ibttf/interview-coder-frontend/discussions)
- Join our [Discord](https://discord.gg/interview-coder)
- Email us at [dev@interviewcoder.com](mailto:dev@interviewcoder.com)

Thank you for contributing to kanapadadu! 🚀
