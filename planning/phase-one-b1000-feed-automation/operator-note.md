# SMP360 Web B-1000 Feed Automation Operator Note

These files are reviewed staging artifacts only. Do not install, copy, enable,
start, reload, or daemon-reload them until a separate owner-approved
operations window.

## Active Trigger Model

- The staged automatic trigger is `smp360-web-b1000-feed.timer` only.
- The staged timer runs hourly at minute `:47` UTC and remains bound to
  `smp360-web-b1000-feed.service`.
- `smp360-web-b1000-feed.path` is retained only as a retired review artifact
  from the earlier registry-watcher design. Do not install or copy it into
  `~/.config/systemd/user/`.

The service continues to depend on the existing shared publisher's lock
directory, debounce, public-tree validator, exact changed-path proof, and
remote `origin/gh-pages` reconciliation before push.

## Staged Files

- `smp360-web-b1000-feed.path` is retired review history only and is not part
  of the active automation design.
- `smp360-web-b1000-feed.service` runs the existing shared publisher with
  `--push`.
- `smp360-web-b1000-feed.timer` is the sole automatic trigger and runs at
  `:47` UTC each hour.

## Local Validation Commands

Run these before any later install or enablement window:

```bash
git -C /home/testman001/smp360/smp360-web status --short --branch
git -C /home/testman001/smp360/smp360-web diff -- planning/phase-one-b1000-feed-automation
git -C /home/testman001/smp360/smp360-web diff --check -- planning/phase-one-b1000-feed-automation
systemd-analyze verify --user /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.path /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.service /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.timer
systemctl --user cat smp360-web-b1000-feed.timer 2>/dev/null || true
```

For a no-publication smoke check, use a disposable local clone or worktree and
run the publisher without `--push`. Do not run the staged service against the
live public checkout until credentials and owner approval are both confirmed.

## Staged-File Review Commands

```bash
git -C /home/testman001/smp360/smp360-web diff -- planning/phase-one-b1000-feed-automation
rg -n ":47|retired|sole automatic trigger|do not install" /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation
rg -n "systemctl|daemon-reload|enable|start|secret|token|credential" /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation
```

The unit files must not contain secrets. Git authentication should be provided
by a separately reviewed, repository-scoped credential mechanism outside
tracked files.

## Later Install Window

Only after separate owner approval:

```bash
mkdir -p ~/.config/systemd/user
cp /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.service ~/.config/systemd/user/
cp /home/testman001/smp360/smp360-web/planning/phase-one-b1000-feed-automation/smp360-web-b1000-feed.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now smp360-web-b1000-feed.timer
systemctl --user status smp360-web-b1000-feed.timer
```

Do not install or copy `smp360-web-b1000-feed.path` during this or any other
window unless a later separately approved PromptQ explicitly restores the
registry-watcher design.

## Rollback

Only after separate owner approval:

```bash
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
