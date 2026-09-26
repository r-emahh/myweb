# Project Automation Configuration

## Base Branch

`master`

## Development Server

### Start Command

`pwsh -File scripts/serve.ps1`

### URL

`http://127.0.0.1:8080/`

## Verification

### Build

Not configured.

### Lint

Not configured.

### Type Check

Not configured.

### Test

Not configured.

### E2E

Not configured.

### Browser

Use Playwright MCP.

Before browser verification:

1. Start the development server using the configured Start Command.
2. Wait until the configured URL is reachable.
3. Run browser verification against the configured URL.
4. Stop the development server after verification.

Do not generate an alternative temporary HTTP server when the configured Start Command is available.