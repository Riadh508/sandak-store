# Testing Guide

## Vitest Setup

This project uses Vitest for unit testing.

### Run Tests Locally

```bash
# Install dependencies
npm install

# Run tests once
npm run test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### CI

Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`).
