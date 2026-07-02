# Phase One B-1000 Agent Spawn Feed Implementation Plan

Prepared: 2026-07-02
Project: `smp360-web`
Planner scope: produce an implementation-ready plan for the B-1000 public feed checkpoint without changing public site source.

## Objective

Publish the first SMP360 Web agent spawn feed as literal JSON. Keep the first version deliberately simple: take approved registry entries directly from B-1000 `registry.json` and display them without renaming fields or joining additional project/model data.

The first-screen feed updates from an agent reaching `status: "ready"`. The page prints that ready registry entry directly. An expandable scroll area can show the last 25 spawned registry entries.

Starch API and funding-feed changes are deferred until this agent spawn feed works.

## Feed Contract

Generated public file:

```text
data/b1000-agent-spawns.json
```

Top-level generated shape:

```json
{
  "schemaVersion": "1.0.0",
  "generatedAt": "2026-07-02T00:00:00Z",
  "source": "b-1000-registry",
  "currentReadyAgent": {
    "agentName": "b1000-example-agent-0000",
    "createdAt": "2026-07-02T00:00:00Z",
    "project": "smp360-web",
    "role": "planning-agent",
    "status": "ready",
    "statusAt": "2026-07-02T00:01:00Z"
  },
  "recentSpawnedAgents": [
    {
      "agentName": "b1000-example-agent-0000",
      "createdAt": "2026-07-02T00:00:00Z",
      "project": "smp360-web",
      "role": "planning-agent",
      "status": "ready",
      "statusAt": "2026-07-02T00:01:00Z"
    }
  ]
}
```

Rules:

- `currentReadyAgent` is copied directly from the newest registry entry whose current `status` is `ready`, sorted by `statusAt` descending.
- If no ready agent exists, publish `currentReadyAgent: null`.
- `recentSpawnedAgents` is copied directly from the last 25 registry entries, sorted by `createdAt` descending.
- Do not rename registry fields for this first version.
- Do not add project type, model provenance, role metadata, Good Morning data, context data, or Captain's Log data in this first version.
- Do not publish local paths, credentials, private context, role authority records, or any file beyond the generated public feed.

## Private Generator

Create a private-side generator on the GMKtec server, not in the public GitHub Pages workflow.

Recommended private source path:

```text
/home/testman001/smp360-labs/b-1000/scripts/generate-smp360-web-agent-spawn-feed.mjs
```

Input:

```text
/home/testman001/smp360-labs/b-1000/registry.json
```

Output:

```text
/home/testman001/smp360-publish/smp360-web/data/b1000-agent-spawns.json
```

Implementation requirements:

- Parse `registry.json` with Node built-ins.
- Validate that `agents` is an array.
- Copy only these registry fields: `agentName`, `createdAt`, `project`, `role`, `status`, `statusAt`.
- Validate copied timestamp strings are parseable.
- Write deterministic pretty JSON with a trailing newline.
- Write to a temporary file first, then rename into place.
- Exit nonzero if source JSON is malformed, required registry fields are missing, timestamps are invalid, or unexpected output keys are present.

## Public Site Integration

Update `index.html` after the feed contract is approved:

- Fetch `data/b1000-agent-spawns.json` with `cache: "no-store"`.
- Render `currentReadyAgent` with `JSON.stringify(feed.currentReadyAgent, null, 2)` inside a `<pre>`.
- If `currentReadyAgent` is `null`, render a small literal JSON empty state.
- Add an expandable control for `recentSpawnedAgents`.
- Inside the expanded area, render the last 25 spawned entries as pretty JSON in a scrollable `<pre>`.
- Keep presentation minimal.

Recommended markup target:

```html
<pre id="current-agent-json" aria-live="polite">loading agent feed...</pre>
<details id="recent-agents">
  <summary>last 25 spawned agents</summary>
  <pre id="recent-agents-json"></pre>
</details>
```

## Public Boundary

Allowlisted public files for this step:

```text
.nojekyll
CNAME
README.md
index.html
assets/starch/**
data/b1000-agent-spawns.json
scripts/sync-starch-assets.mjs
.github/workflows/sync-starch-assets.yml
```

Rules:

- Keep the public deployment repository isolated from `/home/testman001/smp360/smp360-web`.
- Copy only allowlisted public files into the publish repo.
- Never copy `context/`, `planning/`, raw B-1000 files, private logs, credentials, or archives into the public repository.

## Validation

Private validation should confirm:

- Public tree contains only allowlisted paths.
- `data/b1000-agent-spawns.json` is valid JSON.
- `currentReadyAgent` is either `null` or has `status: "ready"`.
- `recentSpawnedAgents` contains at most 25 entries.
- Every published agent contains only `agentName`, `createdAt`, `project`, `role`, `status`, and `statusAt`.
- `recentSpawnedAgents` is sorted by `createdAt` descending.
- No forbidden keys are present, including `path`, `entryFile`, `contextFile`, `aliases`, `authority`, `permissions`, `approvalRequiredFor`, `contracts`, `workflow`, `skills`, `brief`, `captainsLog`, `secret`, `token`, `credential`, or `privateKey`.

## Publish Trigger And Flow

Prefer an update-triggered publisher on the GMKtec server.

Recommended trigger:

- Use a user-level `systemd.path` unit, or the closest available equivalent, to watch `/home/testman001/smp360-labs/b-1000/registry.json`.
- Trigger the feed generator/publisher service when `registry.json` changes.
- Add a lock or debounce so bursts of registry writes collapse into one publish run.
- Add a low-frequency fallback timer so missed filesystem events are eventually corrected without making the main behavior timer-driven.

1. Generate `data/b1000-agent-spawns.json` from private B-1000 `registry.json`.
2. Copy allowlisted public files into the isolated publish repo.
3. Run validation.
4. If no Git diff exists, exit successfully.
5. Commit with message `chore: publish b1000 agent spawn feed`.
6. Push to `gh-pages`.

The trigger should publish registry updates within the 15-minute target, whether agents are spawned rarely or several times in a day.

## Future Feed Expansion Notes

Before archiving planning context, preserve these items for later:

- Newly published Starch One API endpoints and response examples.
- Funding-feed fields the owner wants changed.
- Which future fields are public-safe versus private-only.
- Whether model provenance should later be added from Good Morning records.
- Whether project type should later be joined from `projects.json`.

These are explicitly not in the first direct-registry feed.

## Builder Handoff

Implement in this order:

1. Build the private generator from `registry.json` only.
2. Build validation for the generated feed and public tree.
3. Generate `data/b1000-agent-spawns.json`.
4. Update the public page to render `currentReadyAgent` and expandable `recentSpawnedAgents`.
5. Add an update-triggered publisher for `registry.json` changes, with debounce/locking and a fallback timer.
6. Verify the latest ready agent appears publicly within 15 minutes and no private fields are exposed.
