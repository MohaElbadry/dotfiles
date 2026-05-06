import { existsSync, readFileSync, mkdirSync } from 'fs'
import { log, banner } from '../utils/logger.js'
import { sh, shLive } from '../utils/shell.js'
import { PATHS } from '../utils/paths.js'

// ── Installers ────────────────────────────────────────────────────────────────

async function installOhMyZsh() {
  log.step('Oh My Zsh')
  if (existsSync(`${PATHS.home}/.oh-my-zsh`)) {
    log.dim('Already installed.')
  } else {
    log.info('Installing Oh My Zsh...')
    const ok = await shLive(
      'RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"'
    )
    ok ? log.success('Oh My Zsh installed.') : log.error('Oh My Zsh install failed.')
  }

  // Install custom plugins from saved URLs (Improvement B)
  log.info('Installing custom zsh plugins...')
  if (!existsSync(PATHS.backup.omzPlugins)) {
    log.warn('omz-plugins.json not found in backup.')
    return
  }

  const plugins = JSON.parse(readFileSync(PATHS.backup.omzPlugins, 'utf8'))
  const pluginsDir = `${PATHS.home}/.oh-my-zsh/custom/plugins`
  mkdirSync(pluginsDir, { recursive: true })

  for (const [name, url] of Object.entries(plugins)) {
    const dest = `${pluginsDir}/${name}`
    if (existsSync(dest)) {
      log.dim(`${name}: already exists, pulling latest...`)
      await sh(`git -C "${dest}" pull --ff-only 2>/dev/null`)
    } else {
      log.info(`Cloning ${name}...`)
      const { ok } = await sh(`git clone "${url}" "${dest}"`)
      ok ? log.success(name) : log.error(`Failed to clone ${name}`)
    }
  }
}

async function installSpicetify() {
  log.step('Spicetify')
  const { ok: hasSpotify } = await sh('which spotify')
  if (!hasSpotify) {
    log.warn('Spotify not found — install Spotify first, then run spicetify setup.')
    return
  }

  const { ok: hasSpice } = await sh('which spicetify')
  if (!hasSpice) {
    log.info('Installing spicetify...')
    await shLive('curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh')
  }

  // Restore config
  if (existsSync(PATHS.backup.spicetify)) {
    log.info('Restoring spicetify config...')
    mkdirSync(`${PATHS.home}/.config/spicetify`, { recursive: true })
    await sh(`cp "${PATHS.backup.spicetify}/config-xpui.ini" "${PATHS.home}/.config/spicetify/"`)

    for (const sub of ['Themes', 'Extensions']) {
      const src = `${PATHS.backup.spicetify}/${sub}`
      if (existsSync(src)) {
        mkdirSync(`${PATHS.home}/.config/spicetify/${sub}`, { recursive: true })
        await sh(`cp -r "${src}/." "${PATHS.home}/.config/spicetify/${sub}/"`)
      }
    }
    log.success('Spicetify config restored.')
    log.dim('Run: spicetify apply   (after Spotify is open)')
  }
}

async function installAptPackages() {
  log.step('APT packages')
  if (!existsSync(PATHS.backup.pkgApt)) { log.warn('apt.txt not found.'); return }
  await shLive('sudo apt update -qq')
  const packages = readFileSync(PATHS.backup.pkgApt, 'utf8').split('\n').filter(Boolean)
  log.info(`Installing ${packages.length} packages...`)
  for (const pkg of packages) {
    const { ok } = await sh(`sudo apt install -y "${pkg}" 2>/dev/null`)
    ok ? log.success(pkg) : log.dim(`skipped: ${pkg}`)
  }
}

async function installSnapPackages() {
  log.step('Snap packages')
  if (!existsSync(PATHS.backup.pkgSnap)) { log.warn('snap.txt not found.'); return }
  const classicSnaps = new Set(['code', 'obsidian', 'intellij-idea-ultimate', 'goland', 'webstorm'])
  const packages = readFileSync(PATHS.backup.pkgSnap, 'utf8').split('\n').filter(Boolean)
  for (const pkg of packages) {
    const flag = classicSnaps.has(pkg) ? '--classic' : ''
    const { ok } = await sh(`sudo snap install ${pkg} ${flag} 2>/dev/null`)
    ok ? log.success(pkg) : log.dim(`skipped: ${pkg}`)
  }
}

async function installFlatpakApps() {
  log.step('Flatpak apps')
  if (!existsSync(PATHS.backup.pkgFlatpak)) { log.warn('flatpak.txt not found.'); return }
  await sh('flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo')
  const apps = readFileSync(PATHS.backup.pkgFlatpak, 'utf8').split('\n').filter(Boolean)
  for (const app of apps) {
    const { ok } = await sh(`flatpak install -y flathub "${app}" 2>/dev/null`)
    ok ? log.success(app) : log.dim(`skipped: ${app}`)
  }
}

async function installBrewPackages() {
  log.step('Brew packages')
  const { ok: hasBrew } = await sh('which brew')
  if (!hasBrew) {
    log.info('Installing Homebrew...')
    await shLive('NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"')
  }
  if (!existsSync(PATHS.backup.pkgBrew)) { log.warn('brew.txt not found.'); return }
  const packages = readFileSync(PATHS.backup.pkgBrew, 'utf8').split('\n').filter(Boolean)
  for (const pkg of packages) {
    const { ok } = await sh(`brew install "${pkg}" 2>/dev/null`)
    ok ? log.success(pkg) : log.dim(`skipped: ${pkg}`)
  }
}

async function installWhiteSurTheme() {
  log.step('WhiteSur Theme & Icons')
  if (existsSync('/usr/share/themes/WhiteSur-Light')) {
    log.dim('WhiteSur theme already installed.')
  } else {
    log.info('Installing WhiteSur GTK theme...')
    const tmp = `/tmp/whitesur-theme-${Date.now()}`
    await shLive(`git clone https://github.com/vinceliuice/WhiteSur-gtk-theme.git ${tmp} && bash ${tmp}/install.sh -t all -l && rm -rf ${tmp}`)
  }
  if (existsSync('/usr/share/icons/WhiteSur-light')) {
    log.dim('WhiteSur icons already installed.')
  } else {
    log.info('Installing WhiteSur icons...')
    const tmp = `/tmp/whitesur-icons-${Date.now()}`
    await shLive(`git clone https://github.com/vinceliuice/WhiteSur-icon-theme.git ${tmp} && bash ${tmp}/install.sh && rm -rf ${tmp}`)
  }
}

async function installGnomeExtensions() {
  log.step('GNOME Extensions')
  const { ok: hasGext } = await sh('which gext')
  if (!hasGext) {
    log.info('Installing gnome-extensions-cli...')
    await sh('pip3 install gnome-extensions-cli --break-system-packages 2>/dev/null')
  }

  const extIds = [
    'blur-my-shell@aunetx',
    'dash-to-panel@jderose9.github.com',
    'compiz-alike-magic-lamp-effect@hermes83.github.com',
    'clipboard-history@alexsaveau.dev',
    'tiling-assistant@ubuntu.com',
    'system-monitor@gnome-shell-extensions.gcampax.github.com',
    'places-menu@gnome-shell-extensions.gcampax.github.com',
    'lockscreen-extension@pratap.fastmail.fm',
  ]

  for (const ext of extIds) {
    const { ok } = await sh(`gext install "${ext}" 2>/dev/null`)
    ok ? log.success(ext) : log.warn(`Manual install needed: ${ext}`)
  }

  log.dim('Restoring extension settings from dconf...')
  await sh(`dconf load /org/gnome/shell/extensions/ < "${PATHS.backup.gnomeExt}"`)
  log.success('Extension settings restored.')
}

async function applyConfigs() {
  log.step('Applying dotfile configs')

  const copies = [
    [PATHS.backup.zshrc,   PATHS.configs.zshrc],
    [PATHS.backup.bashrc,  PATHS.configs.bashrc],
    [PATHS.backup.profile, PATHS.configs.profile],
    [PATHS.backup.gitconfig, PATHS.configs.gitconfig],
    [PATHS.backup.zed,     PATHS.configs.zed],
  ]

  for (const [src, dest] of copies) {
    if (!existsSync(src)) continue
    await sh(`cp "${src}" "${dest}"`)
    log.success(dest.replace(PATHS.home, '~'))
  }

  const dirCopies = [
    [PATHS.backup.nvim,      PATHS.configs.nvim,                     false],
    [PATHS.backup.fish,      PATHS.configs.fish,                     false],
    [PATHS.backup.lf,        PATHS.configs.lf,                       false],
    [PATHS.backup.neofetch,  `${PATHS.home}/.config/neofetch`,       false],
    [PATHS.backup.autostart, PATHS.configs.autostart,                false],
  ]

  for (const [src, dest] of dirCopies) {
    if (!existsSync(src)) continue
    mkdirSync(dest, { recursive: true })
    await sh(`cp -r "${src}/." "${dest}/"`)
    log.success(dest.replace(PATHS.home, '~'))
  }

  // GTK themes
  await sh(`mkdir -p "${PATHS.home}/.config/gtk-3.0" "${PATHS.home}/.config/gtk-4.0"`)
  if (existsSync(PATHS.backup.gtk3)) await sh(`cp "${PATHS.backup.gtk3}" "${PATHS.configs.gtk3}"`)
  if (existsSync(PATHS.backup.gtk4)) await sh(`cp "${PATHS.backup.gtk4}" "${PATHS.configs.gtk4}"`)

  // Restore GNOME interface settings (theme, icons)
  await sh(`dconf load /org/gnome/desktop/interface/ < "${PATHS.backup.gnomeIface}"`)
  await sh(`dconf load /org/gnome/shell/ < "${PATHS.backup.gnomeShell}"`)
  log.success('GNOME settings restored')
}

async function installClaudeCLI() {
  log.step('Claude Code CLI')
  const { ok } = await sh('which claude')
  if (ok) { log.dim('Claude already installed.'); return }
  log.info('Installing Claude Code...')
  const installed = await shLive('npm install -g @anthropic-ai/claude-code')
  installed ? log.success('Claude Code installed.') : log.error('Claude install failed — check npm.')
}

// ── Main install command ──────────────────────────────────────────────────────

const STEPS = [
  { name: 'oh-my-zsh',   label: 'Oh My Zsh + custom plugins',  fn: installOhMyZsh },
  { name: 'apt',         label: 'APT packages (335)',           fn: installAptPackages },
  { name: 'snap',        label: 'Snap packages',                fn: installSnapPackages },
  { name: 'flatpak',     label: 'Flatpak apps',                 fn: installFlatpakApps },
  { name: 'brew',        label: 'Homebrew packages',            fn: installBrewPackages },
  { name: 'theme',       label: 'WhiteSur GTK theme + icons',   fn: installWhiteSurTheme },
  { name: 'gnome-ext',   label: 'GNOME extensions + settings',  fn: installGnomeExtensions },
  { name: 'spicetify',   label: 'Spicetify (Spotify)',          fn: installSpicetify },
  { name: 'configs',     label: 'Apply dotfile configs',        fn: applyConfigs },
  { name: 'claude',      label: 'Claude Code CLI',              fn: installClaudeCLI },
]

export async function install() {
  banner('dots install')

  const { default: pkg } = await import('enquirer')
  const { MultiSelect } = pkg

  const selected = await new MultiSelect({
    name: 'steps',
    message: 'Select what to install (space to toggle, enter to confirm)',
    choices: STEPS.map(s => ({ name: s.name, message: s.label, value: s.name })),
    initial: STEPS.map(s => s.name),
  }).run().catch(() => null)

  if (!selected || selected.length === 0) {
    log.warn('Nothing selected.')
    return
  }

  for (const name of selected) {
    const step = STEPS.find(s => s.name === name)
    if (step) await step.fn()
  }

  log.blank()
  log.success('Done! Log out and back in for all changes to take effect.')
  log.blank()
}
