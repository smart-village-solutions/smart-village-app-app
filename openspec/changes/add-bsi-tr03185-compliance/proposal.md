# Proposal: BSI TR-03185-2 Compliance Implementation

## Change ID

`add-bsi-tr03185-compliance`

## Why

The Smart Village App needs to comply with BSI TR-03185-2 (Secure Software Lifecycle for Open Source Software) to meet EU Cyber Resilience Act requirements. While basic documentation exists, automated security scanning, SBOM generation, vulnerability management, and enforced code review processes are missing.

## What Changes

- Add automated security scanning with CodeQL and Snyk
- Implement SBOM generation for every release using CycloneDX
- Set up Dependabot for automated dependency updates
- Enhance CONTRIBUTING.md with security standards and review requirements
- Configure branch protection rules requiring PR reviews and passing CI checks
- Create comprehensive security vulnerability reporting and disclosure workflow
- Add checksum generation for release artifacts
- Implement automated testing enforcement with coverage thresholds
- Document reproducible build process
- **BREAKING**: Require all merges to master go through PR review (no direct pushes)
- **BREAKING**: Fail CI builds on high/critical security vulnerabilities

## Impact

### Affected specs

- New capability: `bsi-compliance`

### Affected code

- `.github/workflows/` - New workflows for CodeQL, Snyk, SBOM generation, release checksums
- `.github/dependabot.yml` - Automated dependency management
- `.github/ISSUE_TEMPLATE/` - Enhanced bug report templates
- `.github/pull_request_template.md` - Security and quality checklists
- `CONTRIBUTING.md` - Enhanced with security standards
- `SECURITY.md` - Enhanced with response timelines and disclosure policy
- `docs/BUILD.md` - New reproducible build documentation
- `docs/COMPLIANCE.md` - New BSI TR-03185-2 compliance documentation
- `docs/REPOSITORY_SETUP.md` - New repository configuration guide
- `.eslintrc.yml` - Security plugin rules
- `package.json` - New scripts for SBOM generation

### Repository settings (manual configuration)

- Branch protection for `master` and `release/*` branches
- 2FA requirement for maintainers
- GitHub Private Vulnerability Reporting enabled

## Status

🟡 Proposed

**Branch:** `feat/bsi-compatibility`

**Related Changes:**

- Works alongside `add-jsdoc-integration` (TypeDoc contributes to documentation requirements BR.01)
- Extends existing `licenses-report.yml` workflow (satisfies LE.02)
- Complements existing `generate-docs.yml` workflow

## Problem Statement

The Smart Village App is developed as an open-source project for municipalities and needs to comply with BSI TR-03185-2 to meet EU Cyber Resilience Act requirements. While some documentation exists (CONTRIBUTING.md, SECURITY.md, CHANGELOG.md, LICENSE.md), the project needs:

- **Automated security scanning** and vulnerability management
- **Software Bill of Materials (SBOM)** generation for dependency tracking
- **Enhanced CI/CD pipelines** with security checks
- **Code review enforcement** through branch protection
- **Automated testing** and quality gates
- **Build reproducibility** and integrity verification
- **Comprehensive contributor guidelines** with security standards
- **Automated dependency updates** with security alerts

## Goals

1. ✅ **Governance (GV)**: Enhance contribution guidelines, implement access controls, enforce 2FA
2. ✅ **Legal (LE)**: Maintain license compliance automation (already implemented via licenses-report.yml)
3. ✅ **Quality Assurance (QA)**: Automate security scanning, testing, SBOM generation
4. ✅ **Build & Release (BR)**: Implement build reproducibility, integrity checks, automated releases
5. ✅ **Vulnerability Management (VM)**: Set up automated vulnerability scanning and disclosure process
6. ⚠️ **Decommissioning (DE)**: Document deprecation process (documentation-only, minimal code changes)

## Non-Goals

- Manual audit processes (outside code scope)
- Organizational governance structure (outside code scope)
- Bug bounty program setup (external service)
- External certification/audit execution

## Proposed Solution

### 1. Governance & Access Control (GV.01, GV.02)

- **Update CONTRIBUTING.md** with:
  - Security standards and expectations
  - Code quality requirements (tests, linting, documentation)
  - Review process details
  - Developer Certificate of Origin (DCO)
- **GitHub Repository Settings** (manual configuration documented):
  - Branch protection for `master` and `release/*` branches
  - Require PR reviews before merge
  - Require status checks to pass
  - Enforce 2FA for maintainers with write access
  - Enable audit logs

### 2. Quality Assurance Automation (QA.01-QA.06)

#### QA.01: SBOM Generation

```yaml
# .github/workflows/sbom-generation.yml
- Generate CycloneDX SBOM on every release
- Include in release artifacts as sbom.json
- Track all dependencies with versions and licenses
```

#### QA.02-QA.03: Bug Reporting & Issue Templates

- Enhance existing issue templates with security classification
- Add security bug template linking to SECURITY.md
- Clear reproduction steps and expected information

#### QA.04: Testing Automation

- Already partially implemented (Jest + Maestro)
- Add coverage threshold enforcement (70%)
- Fail CI if tests don't pass

#### QA.05: Security Scanning

```yaml
# .github/workflows/security-scan.yml
- CodeQL for static analysis
- Snyk/Dependabot for dependency scanning
- ESLint security plugins
- Trivy for container scanning (if applicable)
```

#### QA.06: Code Review

- Enforce via branch protection rules
- Add PR checklist template
- Automated checks before review

### 3. Build & Release Automation (BR.01-BR.06)

#### BR.01: Build Documentation

- Already exists in README.md
- Enhance with environment variable documentation
- Add deterministic build instructions

#### BR.02: Versioning

- Already implemented (Semantic Versioning in package.json)
- Git tags on releases
- Keep a Changelog format (already used)

#### BR.03: Integrity & Authenticity

```yaml
# .github/workflows/release.yml
- Generate SHA256 checksums for release artifacts
- Sign releases with GPG (optional but recommended)
- Verify checksums in documentation
```

#### BR.04: Changelog Automation

- Already maintained manually in CHANGELOG.md
- Consider automation with conventional commits
- Generate release notes from changelog

#### BR.05: Source Package Integrity

- Ensure release packages match repository content
- Use `git archive` or similar for source releases
- No compiled artifacts in source packages

#### BR.06: Reproducible Builds

- Lock file already exists (yarn.lock)
- Document exact build environment (Node version, OS)
- Consider using Docker for builds

### 4. Vulnerability Management (VM.01-VM.02)

#### VM.01: Security Contacts & Disclosure

- SECURITY.md already exists ✅
- Enhance with:
  - PGP key for encrypted reports
  - Expected response times (3 business days)
  - Disclosure timeline (90 days)
  - Bug bounty info (if applicable)

#### VM.02: Vulnerability Publication

```yaml
# .github/workflows/vulnerability-scan.yml
- Weekly automated dependency scans
- GitHub Security Advisories for CVEs
- Automated notifications via Dependabot
- Dashboard warnings for updates
```

### 5. Decommissioning Process (DE.01-DE.02)

- Document deprecation communication policy
- Template for end-of-life announcements
- Migration guide template

## Implementation Phases

**Estimated Effort:** 12-16 weeks (2-3 person-months)
**Team Size:** 1-2 developers + 1 security reviewer

### Phase 1: Foundation (Week 1-2)

- [ ] Update CONTRIBUTING.md with security standards
- [ ] Configure branch protection rules
- [ ] Set up Dependabot/Renovate
- [ ] Add CodeQL scanning workflow

### Phase 2: Automation (Week 3-4)

- [ ] Implement SBOM generation workflow
- [ ] Add security scanning workflows (Snyk/Trivy)
- [ ] Create PR review checklist
- [ ] Enhance issue templates

### Phase 3: Build & Release (Week 5-6)

- [ ] Add checksum generation to release workflow
- [ ] Document reproducible build process
- [ ] Implement automated release notes
- [ ] Set up vulnerability disclosure workflow

### Phase 4: Documentation & Validation (Week 7-8)

- [ ] Update all documentation
- [ ] Create compliance self-assessment checklist
- [ ] Validate all workflows
- [ ] Document manual configuration steps

## Success Metrics

- ✅ All MUSS requirements from BSI TR-03185-2 are implemented
- ✅ Automated security scans run on every PR
- ✅ SBOM generated for every release
- ✅ 100% of dependencies tracked and scanned
- ✅ Code review required for all changes
- ✅ Test coverage ≥70%
- ✅ Vulnerability response time ≤3 days

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CI/CD performance degradation | Medium | Optimize workflows, use caching |
| False positives in security scans | Low | Configure ignore rules, manual review |
| Contributor friction from new requirements | Medium | Clear documentation, gradual rollout |
| Maintenance overhead | High | Automate as much as possible |

## Dependencies

- GitHub Actions (already in use)
- Node.js 20+ (already required)
- Third-party security tools (CodeQL, Snyk, or alternatives)
- CycloneDX SBOM generator

## Alternatives Considered

### Alternative 1: Minimal Compliance

- Only implement MUSS requirements
- ❌ Rejected: SOLLTE requirements add significant value

### Alternative 2: External Security Platform

- Use comprehensive third-party platform (e.g., Sonatype, JFrog)
- ❌ Rejected: Too expensive for open-source project

### Alternative 3: Manual Processes

- Handle security checks manually
- ❌ Rejected: Not scalable, error-prone

## Open Questions

1. **Security Scanning Tool:** Which should be primary? (CodeQL, Snyk, Trivy, Semgrep)
   - *Recommendation:* CodeQL (free for public repos) + Dependabot (GitHub native) as baseline, add Snyk if budget allows
2. **GPG Signing:** Enforce for all commits or just releases?
   - *Recommendation:* Start with release signing only, expand to commits if team adopts GPG widely
3. **Budget:** What's available for third-party security tools?
   - *Note:* Most tools have free tiers for open-source projects
4. **Automated Patching:** Implement automatic security patching or manual approval only?
   - *Recommendation:* Manual approval initially, enable auto-merge for low-risk updates after 3 months
5. **Security Review Board:** Do we need a separate board?
   - *Recommendation:* Start with designated security contacts among maintainers, formalize if needed

## Roll-out Strategy

### Communication Plan

1. **Week -2 (before implementation):**
   - Announce upcoming changes in team meeting
   - Share proposal for feedback
   - Answer questions in dedicated discussion thread

2. **Week 0 (start of Phase 1):**
   - Document breaking changes in CHANGELOG.md
   - Send email to all contributors about new requirements
   - Update README with compliance badges

3. **Phase 1-2 (weeks 1-4):**
   - Soft enforcement: warn but don't block on violations
   - Weekly updates on implementation progress
   - Office hours for contributor questions

4. **Phase 3-4 (weeks 5-8):**
   - Full enforcement: block merges on violations
   - Monthly compliance reports
   - Celebrate milestones (first SBOM, zero critical CVEs, etc.)

### Training Materials

- [ ] Video walkthrough of new contribution workflow
- [ ] FAQ document for common security questions
- [ ] Cheat sheet for running security checks locally
- [ ] Template responses for Dependabot PRs

## References

- BSI TR-03185-2: Secure Software Lifecycle for Open Source Software v1.1.0
- EU Cyber Resilience Act (CRA) Regulation 2024/2847
- OpenSSF Security Baseline
- SLSA v1.1
- NIST SSDF (SP 800-218)
- OpenChain Security Assurance (ISO/IEC 18974)

## Stakeholders

- **Maintainers**: Implementation and enforcement
- **Contributors**: Follow new guidelines
- **Municipalities**: Compliance verification
- **Security Team**: Review and advisory

## Approval Required

- [ ] Project Lead
- [ ] Technical Lead
- [ ] Security Lead (if exists)
- [ ] Legal/Compliance (if exists)
