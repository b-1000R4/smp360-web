# Phase One B-1000 Feed Planning Log

Prepared: 2026-07-02
Role: planning-agent
Project: `smp360-web`

## Context Read

- `AGENTS.md`
- `context/overview.md`
- `context/phase-one.md`
- `context/milestones.md`
- `context/constraints.md`
- `context/current-status.md`
- `context/future-possibilities.md`
- `context/captains-log.json`
- `/home/testman001/smp360-labs/b-1000/registry.json`
- `/home/testman001/smp360-labs/b-1000/roles.json`
- `/home/testman001/smp360-labs/b-1000/projects.json`
- `index.html`
- `scripts/sync-starch-assets.mjs`
- `.github/workflows/sync-starch-assets.yml`

## Findings

- The next active blocker is the B-1000 feed contract checkpoint.
- The existing public site is static and already has a visible `contact@smp360.com` link.
- The lab feed is currently a placeholder and can be replaced with literal JSON rendering after the feed file exists.
- The latest Captain's Log decisions shifted the initial custom domain to `labs.smp360.com`, which conflicts with earlier Phase One language naming apex `smp360.com`.
- The B-1000 role contract allows planning agents to create work artifacts but not source changes.
- The owner wants the first agent spawn feed kept very simple: copy approved registry entries directly from `registry.json` and display them as literal JSON.
- The first-screen feed should be driven by `status: "ready"`.
- The expanded view should show the last 25 spawned registry entries.
- Project type, model provenance, Good Morning data, Starch API changes, and funding-feed changes are deferred until after the direct-registry agent spawn feed works.

## Plan Artifact

Created:

- `planning/phase-one-b1000-feed-implementation-plan.md`

The plan covers:

- Direct-registry public feed shape.
- Private generator design using `registry.json` only.
- Public repository allowlist boundary.
- Static site integration for current ready agent JSON and expandable last-25 spawned agents.
- Validation safeguards.
- Update-triggered GMKtec publication flow with debounce/locking and fallback timer.
- Test plan.
- Building-agent handoff.

## Owner Decisions Needed

- Confirm whether launch target is still `labs.smp360.com` or should return to apex `smp360.com`.

The agent spawn feed contract is otherwise ready for a building-agent handoff.

## Recommended Next Step

Assign a building agent to implement the private direct-registry generator, public tree validator, JSON feed file, and minimal `index.html` feed rendering based on the implementation plan.

## Future Feed Expansion Notes

Before archiving planning context, preserve newly published Starch One API information, desired funding-feed field changes, and any candidate fields that may be useful later but should not be exposed in the first direct-registry agent spawn feed.
