# Codex Task Prompt Template

## Purpose

Use this template to keep AI-assisted changes scoped, testable, and safe. It helps define what Codex should inspect, change, avoid, verify, and report before work begins.

## Reusable General Task Template

```markdown
# [Task Title]

Task Type:
[Feature Sprint / Debug Sprint / Documentation Task / Maintenance Task]

Current State / Observed Behavior:
[describe current behavior]

Goal:
[describe the desired outcome]

Scope:
- [what Codex should work on]
- [frontend only / backend only / documentation only]
- [specific module, screen, endpoint, or file area]

Non-Goals / Guardrails:
- Do not implement unrelated improvements, refactors, redesigns, or new features.
- Keep changes minimal and isolated.
- Preserve existing API behavior unless explicitly requested.
- Do not modify frontend and backend together unless explicitly planned.
- Record extra ideas as follow-up suggestions only; do not implement them.

Files Likely Affected:
- [path/to/file]
- [path/to/another-file]

Investigation Required:
- [what Codex should inspect first]
- [what behavior or data should be confirmed before changing code]

Required Behavior:
- [specific behavior 1]
- [specific behavior 2]
- [specific behavior 3]

Acceptance Criteria:
- [clear pass/fail result]
- [clear pass/fail result]
- [clear pass/fail result]

Verification Checklist:
- [command to run, if applicable]
- [manual UI check, if applicable]
- [API or data check, if applicable]
- [confirm no unrelated files changed]

At the End, Report:
- Files changed
- Summary of changes
- Verification results
- Any skipped checks and why
- Follow-up suggestions, if useful
```

## Feature Sprint Example

```markdown
# Feature Sprint: [feature name]

Task Type:
Feature Sprint

Current State / Observed Behavior:
[describe current behavior]

Goal:
Add [feature capability] so users can [desired user outcome].

Scope:
- Update [frontend/backend/documentation area]
- Use existing project patterns
- Keep the implementation simple

Non-Goals / Guardrails:
- Do not implement unrelated improvements, refactors, redesigns, or new features.
- Keep changes minimal and isolated.
- Preserve existing API behavior unless explicitly requested.
- Do not modify frontend and backend together unless explicitly planned.
- Record extra ideas as follow-up suggestions only; do not implement them.

Files Likely Affected:
- [path/to/likely-file]

Investigation Required:
- Inspect [existing file or behavior]
- Confirm [data shape or UI state]

Required Behavior:
- [required behavior]
- [required behavior]

Acceptance Criteria:
- [acceptance criterion]
- [acceptance criterion]

Verification Checklist:
- Run [command]
- Test with [CSV filename]
- Confirm [expected result]

At the End, Report:
- Files changed
- What was added
- Verification results
```

## Debug Sprint Example

```markdown
# Debug Sprint: [bug or issue name]

Task Type:
Debug Sprint

Current State / Observed Behavior:
[describe observed bug]

Goal:
Fix [issue] while preserving existing behavior.

Scope:
- Investigate [frontend/backend/documentation area]
- Make the smallest safe fix

Non-Goals / Guardrails:
- Do not implement unrelated improvements, refactors, redesigns, or new features.
- Keep changes minimal and isolated.
- Preserve existing API behavior unless explicitly requested.
- Do not modify frontend and backend together unless explicitly planned.
- Record extra ideas as follow-up suggestions only; do not implement them.

Files Likely Affected:
- [path/to/likely-file]

Investigation Required:
- Confirm [input, state, API response, or error]
- Check whether [expected property or behavior] exists

Required Behavior:
- [required fixed behavior]
- [fallback or error behavior]

Acceptance Criteria:
- [bug no longer occurs]
- [existing behavior still works]

Verification Checklist:
- Run [command]
- Test with [CSV filename]
- Confirm [expected UI/API result]

At the End, Report:
- Root cause
- Files changed
- Old behavior and new behavior
- Verification results
```

## Fixed Guardrail Block

```markdown
Guardrails:
- Do not implement unrelated improvements, refactors, redesigns, or new features.
- Keep changes minimal and isolated.
- Preserve existing API behavior unless explicitly requested.
- Do not modify frontend and backend together unless explicitly planned.
- Record extra ideas as follow-up suggestions only; do not implement them.
```
