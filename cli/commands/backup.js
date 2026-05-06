import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { log, banner } from '../utils/logger.js'
import { sh, shLive } from '../utils/shell.js'
import { PATHS } from '../utils/paths.js'

function ensureDir(p) {
  const dir = p.endsWith('/') ? p : dirname(p)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

async function exportConfigs() {
  log.step('Exporting configs...')

  const copies = [
    [PATHS.configs.zshrc,   PATHS.backup.zshrc],
    [PATHS.configs.bashrc,  PATHS.backup.bashrc],
    [PATHS.configs.profile, PATHS.backup.profile],
    [PATHS.configs.gitconfig, PATHS.backup.gitconfig],
    [PATHS.configs.gtk3,    PATHS.backup.gtk3],
    [PATHS.configs.gtk4,    PATHS.backup.gtk4],
    [PATHS.configs.gh,      PATHS.backup.gh],
    [PATHS.configs.zed,     PATHS.backup.zed],
  ]

  for (const [src, dest] of copies) {
    if (!existsSync(src)) { log.dim(`skip (not found): ${src}`); continue }
    ensureDir(dest)
    const { ok } = await sh(`cp "${src}" "${dest}"`)
    ok ? log.success(src.replace(PATHS.home, '~')) : log.warn(`failed: ${src}`)
  }

  const dirCopies = [
    [PATHS.configs.nvim,      PATHS.backup.nvim],
    [PATHS.configs.fish,      PATHS.backup.fish],
    [PATHS.configs.kitty,     PATHS.backup.kitty],
    [PATHS.configs.lf,        PATHS.backup.lf],
    [PATHS.configs.neofetch,  PATHS.backup.neofetch],
    [PATHS.configs.mpv,       PATHS.backup.mpv],
    [PATHS.configs.autostart, PATHS.backup.autostart],
  ]

  for (const [src, dest] of dirCopies) {
    if (!existsSync(src)) { log.dim(`skip (not found): ${src}`); continue }
    mkdirSync(dest, { recursive: true })
    const { ok } = await sh(`cp -r "${src}/." "${dest}/"`)
    ok ? log.success(src.replace(PATHS.home, '~')) : log.warn(`failed: ${src}`)
  }

  // Spicetify — skip generated/cache dirs
  if (existsSync(PATHS.configs.spicetify)) {
    mkdirSync(PATHS.backup.spicetify, { recursive: true })
    await sh(`cp "${PATHS.configs.spicetify}/config-xpui.ini" "${PATHS.backup.spicetify}/"`)
    for (const sub of ['Themes', 'Extensions']) {
      const src = `${PATHS.configs.spicetify}/${sub}`
      const dest = `${PATHS.backup.spicetify}/${sub}`
      if (existsSync(src)) {
        mkdirSync(dest, { recursive: true })
        await sh(`cp -r "${src}/." "${dest}/"`)
      }
    }
    log.success('~/.config/spicetify')
  }
}

async function exportPackages() {
  log.step('Exporting package lists...')

  const { stdout: apt } = await sh('apt-mark showmanual')
  const { stdout: snapRaw } = await sh("snap list | awk 'NR>1 {print $1}'")
  const { stdout: flatpak } = await sh('flatpak list --app --columns=application')
  const { stdout: brew } = await sh('brew list 2>/dev/null || true')

  const { writeFileSync } = await import('fs')
  writeFileSync(PATHS.backup.pkgApt,     apt)
  writeFileSync(PATHS.backup.pkgSnap,    snapRaw)
  writeFileSync(PATHS.backup.pkgFlatpak, flatpak)
  writeFileSync(PATHS.backup.pkgBrew,    brew)

  log.success(`apt: ${apt.split('\n').filter(Boolean).length} packages`)
  log.success(`snap: ${snapRaw.split('\n').filter(Boolean).length} packages`)
  log.success(`flatpak: ${flatpak.split('\n').filter(Boolean).length} apps`)
  log.success(`brew: ${brew.split('\n').filter(Boolean).length} packages`)
}

async function exportGnome() {
  log.step('Exporting GNOME settings...')

  const dumps = [
    ['/org/gnome/shell/extensions/',                   PATHS.backup.gnomeExt],
    ['/org/gnome/desktop/interface/',                  PATHS.backup.gnomeIface],
    ['/org/gnome/shell/',                              PATHS.backup.gnomeShell],
    ['/org/gnome/settings-daemon/plugins/media-keys/', PATHS.backup.gnomeKeys],
  ]

  const { writeFileSync } = await import('fs')

  for (const [path, dest] of dumps) {
    const { ok, stdout } = await sh(`dconf dump "${path}"`)
    if (ok) { writeFileSync(dest, stdout); log.success(`dconf ${path}`) }
    else log.warn(`dconf dump failed: ${path}`)
  }

  // Append wm keybindings to same file
  const { stdout: wmKeys } = await sh('dconf dump /org/gnome/desktop/wm/keybindings/')
  const { appendFileSync } = await import('fs')
  appendFileSync(PATHS.backup.gnomeKeys, '\n' + wmKeys)

  const { stdout: enabled } = await sh('gnome-extensions list --enabled')
  writeFileSync(PATHS.backup.gnomeEnabled, enabled)
  log.success('GNOME extensions list')
}

async function showDiff() {
  log.step('Changes since last backup:')

  const { stdout: stat } = await sh(`git -C "${PATHS.dotfiles}" diff --stat HEAD 2>/dev/null || git -C "${PATHS.dotfiles}" diff --cached --stat`)
  const { stdout: untracked } = await sh(`git -C "${PATHS.dotfiles}" ls-files --others --exclude-standard`)

  if (!stat && !untracked) {
    log.dim('No changes detected.')
    return false
  }

  if (stat) {
    stat.split('\n').forEach(line => {
      if (line.includes('|')) {
        const [file, changes] = line.split('|')
        const added = (changes.match(/\+/g) || []).length
        const removed = (changes.match(/-/g) || []).length
        process.stdout.write(`    ${file.trim().padEnd(45)}`)
        if (added)   process.stdout.write(`\x1b[32m+${added}\x1b[0m `)
        if (removed) process.stdout.write(`\x1b[31m-${removed}\x1b[0m`)
        process.stdout.write('\n')
      } else if (line.trim()) {
        console.log(`    ${line.trim()}`)
      }
    })
  }

  if (untracked) {
    untracked.split('\n').filter(Boolean).forEach(f => {
      console.log(`    \x1b[36m${f}\x1b[0m (new file)`)
    })
  }

  return true
}

export async function backup({ interactive = true } = {}) {
  banner('dots backup')

  await exportConfigs()
  await exportPackages()
  await exportGnome()

  const hasChanges = await showDiff()

  if (!hasChanges) {
    log.blank()
    log.info('Everything is already up to date.')
    return
  }

  // In cron/non-interactive mode, auto-commit
  if (!interactive) {
    log.step('Committing and pushing...')
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
    await sh(`git -C "${PATHS.dotfiles}" add -A`)
    await sh(`git -C "${PATHS.dotfiles}" commit -m "chore: auto-backup ${date}"`)
    const { ok } = await sh(`git -C "${PATHS.dotfiles}" push origin main`)
    ok ? log.success('Pushed to GitHub.') : log.warn('Push failed — check your connection.')
    return
  }

  // Interactive: confirm before committing
  const { Confirm, Input } = await import('enquirer')

  const confirm = await new Confirm({
    name: 'proceed',
    message: 'Commit and push these changes?',
    initial: true,
  }).run().catch(() => false)

  if (!confirm) { log.warn('Backup cancelled.'); return }

  const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const defaultMsg = `chore: backup ${date}`

  const message = await new Input({
    name: 'message',
    message: 'Commit message:',
    initial: defaultMsg,
  }).run().catch(() => defaultMsg)

  log.step('Pushing to GitHub...')
  await sh(`git -C "${PATHS.dotfiles}" add -A`)
  await sh(`git -C "${PATHS.dotfiles}" commit -m "${message}"`)
  const { ok, stderr } = await sh(`git -C "${PATHS.dotfiles}" push origin main`)

  if (ok) {
    log.blank()
    log.success('Backup complete and pushed to GitHub.')
  } else {
    log.error(`Push failed: ${stderr}`)
  }
}
