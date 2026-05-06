import { readFileSync, existsSync } from 'fs'
import { log, banner } from '../utils/logger.js'
import { sh } from '../utils/shell.js'
import { PATHS } from '../utils/paths.js'

export async function status() {
  banner('dots status')

  // ── Last backup time ────────────────────────────────────────────────────────
  const { stdout: lastCommit } = await sh(
    `git -C "${PATHS.dotfiles}" log -1 --format="%ar — %s" 2>/dev/null`
  )
  log.step('Last backup')
  log.info(lastCommit || 'No commits yet.')

  // ── Uncommitted config changes ───────────────────────────────────────────────
  log.step('Uncommitted changes')
  const { stdout: diffStat } = await sh(
    `git -C "${PATHS.dotfiles}" diff --stat HEAD 2>/dev/null`
  )
  const { stdout: untracked } = await sh(
    `git -C "${PATHS.dotfiles}" ls-files --others --exclude-standard`
  )

  if (!diffStat && !untracked) {
    log.dim('Nothing changed since last backup.')
  } else {
    if (diffStat) {
      diffStat.split('\n').filter(Boolean).forEach(line => {
        log.dim(line)
      })
    }
    if (untracked) {
      untracked.split('\n').filter(Boolean).forEach(f => {
        log.info(`new: ${f}`)
      })
    }
  }

  // ── Package drift (new packages installed since last backup) ─────────────────
  log.step('Package drift (installed vs backed up)')

  async function getDrift(currentCmd, backupFile, label) {
    if (!existsSync(backupFile)) { log.dim(`${label}: no backup file yet`); return }
    const { stdout: current } = await sh(currentCmd)
    const backed = readFileSync(backupFile, 'utf8')
    const currentSet = new Set(current.split('\n').filter(Boolean))
    const backedSet  = new Set(backed.split('\n').filter(Boolean))
    const added   = [...currentSet].filter(p => !backedSet.has(p))
    const removed = [...backedSet].filter(p => !currentSet.has(p))
    if (!added.length && !removed.length) {
      log.dim(`${label}: in sync`)
    } else {
      added.forEach(p   => log.success(`${label}: +${p}`))
      removed.forEach(p => log.warn(`${label}: -${p} (backed up but not installed)`))
    }
  }

  await getDrift('apt-mark showmanual',                       PATHS.backup.pkgApt,     'apt')
  await getDrift("snap list | awk 'NR>1 {print $1}'",        PATHS.backup.pkgSnap,    'snap')
  await getDrift('flatpak list --app --columns=application',  PATHS.backup.pkgFlatpak, 'flatpak')
  await getDrift('brew list 2>/dev/null || true',             PATHS.backup.pkgBrew,    'brew')

  // ── GitHub sync status ───────────────────────────────────────────────────────
  log.step('GitHub sync')
  const { stdout: behind } = await sh(
    `git -C "${PATHS.dotfiles}" fetch --dry-run 2>&1 | head -3`
  )
  const { stdout: ahead } = await sh(
    `git -C "${PATHS.dotfiles}" rev-list --count origin/main..HEAD 2>/dev/null`
  )
  if (parseInt(ahead) > 0) {
    log.warn(`${ahead} commit(s) not pushed yet — run: dots backup`)
  } else {
    log.success('In sync with GitHub.')
  }

  // ── Shell startup time ───────────────────────────────────────────────────────
  log.step('Shell startup time')
  const { stdout: startupMs } = await sh(
    `{ time zsh -i -c exit; } 2>&1 | grep real | awk '{print $2}'`
  )
  const timeStr = startupMs.trim() || '?'
  const ms = parseFloat(timeStr.replace('m', '').replace('s', '')) * 1000
  if (ms < 500)       log.success(`${timeStr} (fast)`)
  else if (ms < 1000) log.warn(`${timeStr} (a bit slow — check plugins)`)
  else                log.error(`${timeStr} (slow — reduce plugins or lazy-load)`)

  log.blank()
}
