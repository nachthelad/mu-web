# Kanturu compatibility Implementation Plan

**Goal:** Repair confirmed compatibility regressions in mu-web and independently audit BK after the Kanturu client update.
**Architecture:** Explicit audited client adapters; reuse cached singletons and native calculations, never boot another client. Preserve existing engines and storage.
**Tech Stack:** JavaScript, Node tests, Playwright isolated fixtures, official local release tooling.
**Spec:** artifacts/client-kanturu/encargo-prompter.md

## Global Constraints

Preserve existing uncommitted changes. No real account, installation, push or web publication. Unknown builds stay blocked. BK writes require its own permitted workspace access. Execute natively under the user's existing authorization after preparing the Prompter encargo.

## Review Focus

- Missing or ambiguous native interfaces must fail safely.
- Character/account/world changes invalidate identity and drafts.
- Stats aliases must follow the actual Character Info caller.
- C/V and new minimap controls must retain native close behavior.
- BK manual input and Scan availability require separate evidence.

## Task 1: mu-web audited adapter and package

Files: src/extension/page-bridge.js, src/helper/level-helper.user.js, src/radar/golden-radar.user.js only if map catalog needs correction; scripts/character-kanturu-fixture.cjs; tests/client-kanturu.test.cjs; existing client UI suites and scripts/test-ui.cjs; docs/client-kanturu.md and changelog.

- [x] Download root/entry/layout/boot and identify exact exports/callers; retain hashes.
- [x] Extract native calculation, item catalog/tooltips and C/V fixtures; add assertions for native interfaces and new map IDs.
- [x] Add explicit build mapping and run focused unit/browser compatibility suites including unknown/invalid interfaces and account isolation.
- [x] Update docs/version; run official release with all required checks, verify ZIP and recheck current public build.

## Task 2: independent BK audit

Files: BK src/game-adapter.js and its fixtures/tests/docs/package metadata if compatibility changes are proven; follow that project's own AGENTS.md.

- [x] Compare selection, usability, SkillAnimation packet and combo handler with its audited October 22 snapshot.
- [x] Reproduce rejection of the new build; preserve manual rotation/recorder and unknown-build Scan block.
- [x] If needed and permitted, add audited support, run its tests/browser checks/build, and verify its independent ZIP.

No generic approval gate: execution and local repair were already authorized in this chat. Do not commit unrelated existing work.
