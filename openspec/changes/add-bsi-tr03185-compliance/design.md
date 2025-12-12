# Design Document: BSI TR-03185-2 Compliance Implementation

## Technical Architecture

### Overview

This document describes the technical design for implementing BSI TR-03185-2 compliance measures in the Smart Village App. The implementation focuses on automation-first approaches to minimize manual overhead while maximizing security and compliance coverage.

## System Context

```text
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Master   │  │ Release/*  │  │  Feature   │            │
│  │   Branch   │  │  Branches  │  │  Branches  │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         │                │                │                  │
│         └────────────────┴────────────────┘                  │
│                          │                                   │
│                 ┌────────▼────────┐                          │
│                 │  Branch         │                          │
│                 │  Protection     │                          │
│                 │  Rules          │                          │
│                 └────────┬────────┘                          │
│                          │                                   │
│         ┌────────────────┴─────────────────┐                │
│         │                                   │                │
│  ┌──────▼──────┐                    ┌──────▼──────┐         │
│  │  PR Checks  │                    │   CI/CD     │         │
│  │  Required   │                    │  Workflows  │         │
│  └─────────────┘                    └──────┬──────┘         │
│                                             │                │
└─────────────────────────────────────────────┼────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
            ┌───────▼────────┐       ┌───────▼────────┐       ┌────────▼────────┐
            │   Security     │       │    Quality     │       │   Dependency    │
            │   Scanning     │       │   Assurance    │       │   Management    │
            │                │       │                │       │                 │
            │  - CodeQL      │       │  - Jest Tests  │       │  - Dependabot   │
            │  - Snyk        │       │  - Maestro E2E │       │  - SBOM Gen     │
            │  - Trivy       │       │  - ESLint      │       │  - License Check│
            │  - ESLint Sec  │       │  - Coverage    │       │                 │
            └────────┬───────┘       └────────┬───────┘       └────────┬────────┘
                     │                        │                        │
                     └────────────────────────┴────────────────────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │   GitHub Security   │
                                   │       Tab           │
                                   │                     │
                                   │  - Advisories       │
                                   │  - Dependabot       │
                                   │  - Code Scanning    │
                                   │  - Secret Scanning  │
                                   └─────────────────────┘
```

## Component Design

### 1. Security Scanning Pipeline

#### CodeQL Analysis

**Purpose**: Static application security testing (SAST) for JavaScript/TypeScript code

**Workflow**: `.github/workflows/codeql-analysis.yml`

```yaml
name: CodeQL Security Scan

on:
  push:
    branches: [master, release/*]
  pull_request:
    branches: [master]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM

jobs:
  analyze:
    name: Analyze Code
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-extended
          config: |
            paths-ignore:
              - __tests__
              - __maestro__
              - node_modules

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

**Configuration Considerations**:

- Use `security-extended` query suite for comprehensive coverage
- Exclude test directories to reduce noise
- Run on push to protected branches, PRs, and weekly schedule
- Upload results to GitHub Security tab via SARIF

#### Snyk Security Scanning

**Purpose**: Software Composition Analysis (SCA) for dependencies

**Workflow**: `.github/workflows/snyk-security.yml`

```yaml
name: Snyk Security Scan

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
  schedule:
    - cron: '0 3 * * *' # Daily at 3 AM

jobs:
  security:
    name: Snyk Security Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --fail-on=all
          command: test

      - name: Upload results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: snyk.sarif
```

**Configuration**:

- Fail on high/critical vulnerabilities
- Run daily and on PRs
- Upload to GitHub Security tab
- Use `.snyk` file for justified exceptions

#### ESLint Security Rules

**Purpose**: Catch common security issues in code (XSS, SQL injection patterns, etc.)

**Configuration**: `.eslintrc.yml`

```yaml
extends:
  - # ... existing configs
  - plugin:security/recommended

plugins:
  - security

rules:
  security/detect-object-injection: warn
  security/detect-non-literal-regexp: warn
  security/detect-unsafe-regex: error
  security/detect-buffer-noassert: error
  security/detect-child-process: warn
  security/detect-disable-mustache-escape: error
  security/detect-eval-with-expression: error
  security/detect-no-csrf-before-method-override: error
  security/detect-non-literal-fs-filename: warn
  security/detect-non-literal-require: warn
  security/detect-possible-timing-attacks: warn
  security/detect-pseudoRandomBytes: error
```

### 2. SBOM Generation

**Purpose**: Generate Software Bill of Materials for dependency transparency

**Workflow**: `.github/workflows/sbom-generation.yml`

```yaml
name: Generate SBOM

on:
  release:
    types: [created, published]
  workflow_dispatch:

jobs:
  sbom:
    name: Generate Software Bill of Materials
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Install CycloneDX
        run: npm install -g @cyclonedx/cyclonedx-npm

      - name: Generate SBOM (JSON)
        run: cyclonedx-npm --output-file sbom.json --spec-version 1.4

      - name: Generate SBOM (XML)
        run: cyclonedx-npm --output-file sbom.xml --spec-version 1.4 --output-format XML

      - name: Upload SBOM to release
        uses: softprops/action-gh-release@v1
        if: github.event_name == 'release'
        with:
          files: |
            sbom.json
            sbom.xml

      - name: Upload SBOM as artifact
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: |
            sbom.json
            sbom.xml
          retention-days: 90
```

**SBOM Format**: CycloneDX 1.4 (JSON and XML)

**Contents**:

- All production dependencies (not devDependencies)
- Dependency versions
- License information
- Download locations
- Checksums

### 3. Dependency Management

#### Dependabot Configuration

**File**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: daily
      time: "03:00"
      timezone: "Europe/Berlin"
    open-pull-requests-limit: 10
    reviewers:
      - "team/maintainers"
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore"
      include: "scope"
    groups:
      # Group minor and patch updates
      production-dependencies:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
      # Separate group for security updates (always separate)
      security-updates:
        patterns:
          - "*"
        update-types:
          - "security"
    # Ignore specific packages if needed
    ignore:
      - dependency-name: "expo"
        update-types: ["version-update:semver-major"]
```

**Strategy**:

- Daily checks at 3 AM
- Group minor/patch updates to reduce PR volume
- Always separate security updates
- Auto-assign to maintainer team
- Limit to 10 open PRs at a time

### 4. Build and Release Pipeline

#### Release Workflow with Checksums

**Workflow**: `.github/workflows/release.yml`

```yaml
name: Release

on:
  release:
    types: [created, published]

jobs:
  build-and-release:
    name: Build and Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: yarn test

      - name: Build application
        run: yarn prebuild

      # Generate checksums for release artifacts
      - name: Generate checksums
        run: |
          find android ios -type f \( -name "*.apk" -o -name "*.aab" -o -name "*.ipa" \) \
            -exec shasum -a 256 {} \; > checksums.txt

      - name: Upload checksums
        uses: softprops/action-gh-release@v1
        with:
          files: checksums.txt

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release-artifacts
          path: |
            android/**/*.apk
            android/**/*.aab
            ios/**/*.ipa
            checksums.txt
```

#### Reproducible Build Documentation

**File**: `docs/BUILD.md`

**Contents**:

1. **Exact Environment**:
   - Node.js version (from .nvmrc): `20.11.0`
   - Yarn version: `1.22.19`
   - OS: Ubuntu 22.04 LTS (for Linux builds)
   - Xcode version: 15.2 (for iOS builds)
   - Android SDK: 34

2. **Build Steps**:

   ```bash
   # 1. Clone repository
   git clone https://github.com/smart-village-solutions/smart-village-app-app.git
   cd smart-village-app-app
   git checkout v4.1.4  # Specific release tag

   # 2. Install exact dependency versions
   yarn install --frozen-lockfile

   # 3. Verify checksums
   yarn generate-sbom
   # Compare with released SBOM

   # 4. Build
   yarn prebuild
   yarn build:android
   yarn build:ios

   # 5. Verify output checksums
   shasum -a 256 -c checksums.txt
   ```

3. **Environment Variables**: Document required variables (API keys excluded)

### 5. Branch Protection and Review Process

#### Branch Protection Configuration

**Branches**: `master`, `release/*`

**Settings**:

```text
✅ Require pull request reviews before merging
   ├─ Required approvals: 1 (2 for release/*)
   ├─ Dismiss stale reviews on new commits
   └─ Require review from Code Owners

✅ Require status checks to pass before merging
   ├─ Require branches to be up to date
   └─ Status checks:
      ├─ test (Jest)
      ├─ lint (ESLint)
      ├─ codeql
      ├─ snyk-security
      └─ type-check (TypeScript)

✅ Require conversation resolution before merging

✅ Require linear history

✅ Require signed commits (optional, recommended)

✅ Include administrators

❌ Allow force pushes
❌ Allow deletions
```

#### Pull Request Template

**File**: `.github/pull_request_template.md` (enhanced)

```markdown
## Description
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Security fix
- [ ] Documentation update

## Security Checklist
- [ ] No secrets or credentials in code
- [ ] Input validation implemented
- [ ] Authentication/authorization reviewed
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies checked for vulnerabilities
- [ ] HTTPS used for all external requests

## Quality Checklist
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Linting passed
- [ ] Type checking passed (TypeScript)
- [ ] No console.log or debug code

## Testing
<!-- Describe how you tested the changes -->

## Breaking Changes
<!-- If applicable, describe breaking changes and migration path -->

## CHANGELOG
- [ ] CHANGELOG.md updated

## Screenshots
<!-- If applicable, add screenshots -->
```

### 6. Vulnerability Management Workflow

#### Private Vulnerability Reporting

**GitHub Settings**: Enable "Private vulnerability reporting"

**SECURITY.md Enhancement**:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 4.1.x   | :white_check_mark: |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

### Private Reporting (Preferred)

Use GitHub's "Report a vulnerability" button under the Security tab.

### Email

Send to: security@smart-village.app

**Please include**:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### PGP Encryption (Optional)

For sensitive reports, use our PGP key:
[Link to public key]

## Response Timeline

- **Acknowledgment**: Within 3 business days
- **Initial Assessment**: Within 7 days
- **Fix Development**: Depends on severity
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: 90 days
- **Coordinated Disclosure**: Max 90 days after report

## Security Advisory Process

1. Verify vulnerability
2. Develop fix
3. Create GitHub Security Advisory
4. Request CVE (if applicable)
5. Coordinate disclosure with reporter
6. Publish advisory and release patch
7. Notify users via:
   - GitHub Security Advisory
   - Release notes
   - Email newsletter
   - In-app notification (if critical)
```

#### Vulnerability Response Workflow

```text
┌────────────────┐
│  Vulnerability │
│    Reported    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   Acknowledge  │◄─────── Within 3 days
│   (Auto-Reply) │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│     Triage     │
│   & Validate   │
│   (Maintainer) │
└───────┬────────┘
        │
        ├───────────┬──────────┬──────────┐
        ▼           ▼          ▼          ▼
   Critical      High      Medium      Low
   (7 days)   (14 days)  (30 days)  (90 days)
        │           │          │          │
        └───────────┴──────────┴──────────┘
                    │
                    ▼
          ┌──────────────────┐
          │   Develop Fix    │
          │  (Private Branch)│
          └────────┬──────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  Create Security │
          │    Advisory      │
          │  (Private Draft) │
          └────────┬──────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  Coordinate with │
          │     Reporter     │
          └────────┬──────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  Publish Patch   │
          │  & Advisory      │
          └────────┬──────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  Notify Users    │
          │  (Multiple       │
          │   Channels)      │
          └──────────────────┘
```

## Data Flow

### Security Scan Results Flow

```text
Code Change (PR/Push)
        │
        ▼
┌───────────────────┐
│  Trigger Workflows│
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
CodeQL      Snyk
    │         │
    └────┬────┘
         │
         ▼
┌───────────────────┐
│ Upload SARIF to   │
│ GitHub Security   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Security Tab     │
│  - Code Scanning  │
│  - Dependabot     │
│  - Secret Scan    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Alerts/PR Checks │
│  - Block merge    │
│  - Notify team    │
└───────────────────┘
```

### SBOM Generation Flow

```text
Release Created
        │
        ▼
┌───────────────────┐
│  Checkout Code    │
│  (Release Tag)    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Install Deps      │
│ (frozen lockfile) │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Run CycloneDX     │
│ Generator         │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Generate SBOM     │
│ (JSON + XML)      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Upload to Release │
│ Assets            │
└───────────────────┘
```

## Technology Stack

### CI/CD Platform

- **GitHub Actions**: Primary automation platform
- **Workflows as Code**: All workflows version-controlled in `.github/workflows/`

### Technology Stack

| Tool | Purpose | Cost | Integration |
|------|---------|------|-------------|
| GitHub CodeQL | SAST | Free (for public repos) | Native GitHub |
| Snyk | SCA | Free tier available | GitHub Action |
| Dependabot | Dependency updates | Free (GitHub native) | Native GitHub |
| ESLint Security Plugin | Linting | Free | npm package |
| CycloneDX | SBOM generation | Free | npm package |

**Recommended Primary Stack:**

1. **Start with (Phase 1-2):**
   - CodeQL (free, native, excellent JavaScript/TypeScript support)
   - Dependabot (free, native, handles security updates)
   - ESLint security-plugin (free, catches common issues)

2. **Add if budget allows (Phase 3-4):**
   - Snyk (better vulnerability database, $0-129/month)
   - Trivy (container scanning, free)

3. **Monitor & decide:**
   - After 3 months, evaluate false positive rates
   - Compare vulnerability detection overlap
   - Consider consolidating if maintenance overhead too high

### Testing Tools

- **Jest**: Unit and integration tests
- **Maestro**: End-to-end tests
- **TypeScript**: Static type checking
- **ESLint/Prettier**: Code quality

## Security Considerations

### Secrets Management

1. **GitHub Secrets**: Store sensitive tokens (SNYK_TOKEN, signing keys)
2. **Environment Variables**: Never commit `.env` files
3. **Expo Secrets**: Use EAS Secrets for build-time secrets

### Access Control

1. **GitHub Teams**: Define teams with specific permissions
2. **CODEOWNERS**: Require reviews from specific teams for sensitive files
3. **2FA**: Enforce for all maintainers
4. **Personal Access Tokens**: Use fine-grained tokens with minimal scope

### Audit Logging

- Enable GitHub audit log
- Monitor for:
  - Repository settings changes
  - Permission changes
  - Secret access
  - Branch protection bypasses

## Performance Considerations

### Workflow Optimization

1. **Caching**:
   - Use `actions/cache` for `node_modules`
   - Cache Yarn cache directory
   - Cache TypeScript build output

2. **Parallelization**:
   - Run independent jobs in parallel
   - Use matrix strategy for multi-language scans

3. **Conditional Execution**:
   - Skip scans for documentation-only changes
   - Use `paths` and `paths-ignore` filters

### Resource Usage

| Workflow | Frequency | Avg Duration | Monthly Minutes |
|----------|-----------|--------------|-----------------|
| CodeQL | Weekly + PRs | ~10 min | ~100 |
| Snyk | Daily + PRs | ~5 min | ~250 |
| Tests | Every PR | ~8 min | ~400 (est) |
| SBOM | Per release | ~3 min | ~10 |
| **Total** | | | **~760 min/month** |

GitHub Actions free tier: 2,000 minutes/month (public repos: unlimited)

## Monitoring and Alerting

### Metrics to Track

1. **Security Metrics**:
   - Number of vulnerabilities found (by severity)
   - Time to fix vulnerabilities
   - Number of security advisories published
   - Dependency freshness (age of outdated packages)

2. **Quality Metrics**:
   - Test coverage percentage
   - Build success rate
   - PR merge time
   - Code review turnaround time

3. **Compliance Metrics**:
   - BSI TR-03185-2 requirement coverage
   - SBOM generation success rate
   - Branch protection violations

### Alert Channels

- **Critical/High Vulnerabilities**: Email to security team
- **Failed Security Scans**: GitHub notification + Slack (if configured)
- **Dependabot PRs**: Auto-assign to maintainers
- **Security Advisories**: Public GitHub advisory + email list

## Maintenance and Updates

### Regular Review Schedule

- **Weekly**: Review Dependabot PRs
- **Monthly**: Review security scan results, update dependencies
- **Quarterly**: Review and update security policies, audit team access
- **Annually**: Full compliance audit, update tooling

### Keeping Tools Updated

- **GitHub Actions**: Dependabot updates action versions
- **npm Packages**: Dependabot updates security tools
- **Manual Reviews**: Review new CodeQL queries, Snyk rules

## Migration Path

For existing projects implementing BSI TR-03185-2:

1. **Phase 1**: Start with documentation (CONTRIBUTING, SECURITY)
2. **Phase 2**: Enable free GitHub native tools (Dependabot, CodeQL)
3. **Phase 3**: Add SBOM generation
4. **Phase 4**: Add third-party scans (Snyk)
5. **Phase 5**: Enforce via branch protection

## References

- [BSI TR-03185-2](https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/TechGuidelines/TR03185/BSI-TR-03185-2.html)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [CycloneDX Specification](https://cyclonedx.org/specification/overview/)
- [OpenSSF Scorecard](https://github.com/ossf/scorecard)
- [SLSA Framework](https://slsa.dev/)
