# SMP360 Web B-1000 Feed Automation Operator Note

These files are reviewed staging artifacts only. Do not install, enable, start,
reload, or daemon-reload them until a separate owner-approved operations
window.

## Staged Files

- `smp360-web-b1000-feed.path` watches
  `/home/testman001/smp360-labs/_shared/agents/registry.json`.
- `smp360-web-b1000-feed.service` runs the existing shared publisher with
  `--push`.
- `smp360-web-b1000-feed.timer` provides a 10-minute fallback trigger.

The service depends on the publisher's lock directory, debounce, public-tree
validator, exact changed-path proof, and remote `origin/gh-pages` reconciliation
before push.

## Local Validation Commands

Run these before any install or enablement window:

```bash
git -C /home/testman001/smp360/smp360-web status --short --branch
git -C /home/testman001/smp360-publish/smp360-web status --short --branch
git -C /home/testman001/smp360-publish/smp360-web rev-parse --abbrev-ref --symbolic-full-name '@{u}'
node --check /home/testman001/smp360-labs/_shared/tools/feeds/publish-smp360-web-agent-spawns.mjs
node /home/testman001/smp360-labs/_shared/tools/feeds/validate-smp360-web-public-tree.mjs --public-root=/home/testman001/smp360-publish/smp360-web
git -C /home/testman001/smp360-labs diff --check -- _shared/tools/feeds/publish-smp360-web-agent-spawns.mjs
git -C /home/testman001/smp360/smp360-web diff --check -- planning/phase-one-b1000-feed-automation
systemd-analyze verify --user /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.path /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.service /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.timer
```

For a no-publication smoke check, use a disposable local clone or worktree and
run the publisher without `--push`. Do not run the staged service against the
live public checkout until credentials and owner approval are both confirmed.

## Staged-File Review Commands

```bash
git -C /home/testman001/smp360-labs diff -- _shared/tools/feeds/publish-smp360-web-agent-spawns.mjs
git -C /home/testman001/smp360/smp360-web diff -- planning/phase-one-b1000-feed-automation
rg -n "systemctl|daemon-reload|enable|start|secret|token|credential" /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation
```

The unit files must not contain secrets. Git authentication should be provided
by a separately reviewed, repository-scoped credential mechanism outside tracked
files.

## Later Install Window

Only after separate owner approval:

```bash
mkdir -p ~/.config/systemd/user
cp /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.path ~/.config/systemd/user/
cp /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.service ~/.config/systemd/user/
cp /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now smp360-web-b1000-feed.path
systemctl --user enable --now smp360-web-b1000-feed.timer
systemctl --user status smp360-web-b1000-feed.path smp360-web-b1000-feed.timer
```

Do not run these commands during this PromptQ.

## Rollback

Only after separate owner approval:

```bash
systemctl --user disable --now smp360-web-b1000-feed.path
systemctl --user disable --now smp360-web-b1000-feed.timer
systemctl --user reset-failed smp360-web-b1000-feed.service
```

Remove staged or installed unit files only if cleanup is explicitly authorized.

## Manual Fallback

If unattended publishing fails, use the existing manual path in an approved
operator window:

```bash
node /home/testman001/smp360-labs/_shared/tools/feeds/publish-smp360-web-agent-spawns.mjs --push
```

The publisher should fail closed rather than broadening credentials, bypassing
the validator, or publishing any file outside `data/b1000-agent-spawns.json`.
