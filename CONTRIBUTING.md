# Contributing to Mission Control

Thank you for your interest in contributing! This document outlines how to get started.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue with:

1. **Clear title** — Summarize the bug
2. **Steps to reproduce** — Detailed steps
3. **Expected behavior** — What should happen
4. **Actual behavior** — What actually happened
5. **Screenshots** — If applicable
6. **Environment** — OS, Node version, browser

### Suggesting Features

Have an idea? Open an issue with:

1. **Feature description** — What does it do?
2. **Use case** — Why is it useful?
3. **Mockups** — If you have UI ideas

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   npm run test:e2e
   ```
5. **Commit with clear message**
   ```bash
   git commit -m "Add: feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mission-control.git
cd mission-control

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Project Structure

```
mission-control/
├── frontend/          # Next.js dashboard
│   ├── app/          # Pages and routes
│   ├── components/   # React components
│   └── lib/          # Utilities
├── backend/           # Express API
│   ├── routes/       # API endpoints
│   └── db/           # Database setup
├── docs/             # Documentation
└── examples/         # Example configs
```

## Coding Standards

### TypeScript

- Use strict mode
- Define types for all props
- Avoid `any` when possible

### Components

- Functional components with hooks
- Props interface at top of file
- Export components as default

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
```

### Styling

- Use Tailwind CSS classes
- Follow existing patterns
- Mobile-first responsive design

### Commits

Use conventional commits:

- `Add:` — New feature
- `Fix:` — Bug fix
- `Update:` — Refactor or improvement
- `Docs:` — Documentation changes
- `Test:` — Adding tests

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Writing Tests

- Test user interactions, not implementation
- Use `data-testid` attributes for selectors
- Keep tests independent

## Documentation

When adding features:

1. Update relevant docs in `/docs`
2. Add inline comments for complex logic
3. Update README if needed

## Review Process

1. PRs require 1 approval
2. All tests must pass
3. No merge conflicts
4. Follows coding standards

## Getting Help

- 💬 [Discord](https://discord.com/invite/clawd)
- 📧 [Email](mailto:support@openclaw.ai)
- 📖 [Documentation](./docs/)

## Recognition

Contributors are recognized in:

- README contributors section
- Release notes
- Discord community

---

Thank you for contributing to Mission Control! 🚀
