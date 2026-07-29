# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in `@anter/ai-chat-sdk`, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities.
2. Email your findings to [security@anter.ai](mailto:security@anter.ai).
3. Include detailed steps to reproduce the vulnerability.
4. Allow up to 48 hours for an initial response from the maintainers.

### What to Include

- Type of vulnerability (e.g. XSS in chat renderer, sensitive data leakage, prototype pollution)
- Full paths of affected source files
- Location of affected code (branch/commit or line references)
- Step-by-step instructions or minimal reproduction sample
- Impact of the issue

### What to Expect

- Acknowledgment of your report within 48 hours
- Regular updates on resolution progress
- Credit in the security advisory (if desired)
- Notification when the fix is released

## Security Best Practices

When integrating or contributing to `@anter/ai-chat-sdk`:

- Never hardcode backend API keys, tokens, or credentials in client-side code.
- Use secure authentication tokens (JWTs, session cookies) in custom adapters (`ChatAdapter`).
- Sanitize HTML content if using custom markdown renderers or rich components.
- Keep dependencies updated using audit tools (`pnpm audit`).
