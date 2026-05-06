#!/usr/bin/env bash
# Daily dotfiles backup — exports configs, commits, pushes to GitHub

set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$DOTFILES_DIR/.backup.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "Starting backup..."

# ── Shell configs ──────────────────────────────────────────────────────────────
cp ~/.zshrc         "$DOTFILES_DIR/configs/zsh/.zshrc"
cp ~/.profile       "$DOTFILES_DIR/configs/zsh/.profile"
cp ~/.bashrc        "$DOTFILES_DIR/configs/bash/.bashrc"

# ── App configs ────────────────────────────────────────────────────────────────
cp ~/.config/neofetch/config.conf "$DOTFILES_DIR/configs/neofetch/"
cp -r ~/.config/lf/*              "$DOTFILES_DIR/configs/lf/"
cp -r ~/.config/fish/*            "$DOTFILES_DIR/configs/fish/"
cp -r ~/.config/nvim/*            "$DOTFILES_DIR/configs/nvim/"
cp ~/.config/gtk-3.0/settings.ini "$DOTFILES_DIR/configs/gtk/gtk3-settings.ini"
[ -f ~/.config/gtk-4.0/settings.ini ] && \
  cp ~/.config/gtk-4.0/settings.ini "$DOTFILES_DIR/configs/gtk/gtk4-settings.ini"
[ -f ~/.config/kitty/kitty.conf ] && \
  cp -r ~/.config/kitty/* "$DOTFILES_DIR/configs/kitty/"
[ -f ~/.config/gh/config.yml ] && \
  cp ~/.config/gh/config.yml "$DOTFILES_DIR/configs/gh/config.yml"
[ -f ~/.config/mpv/mpv.conf ] && \
  cp -r ~/.config/mpv/* "$DOTFILES_DIR/configs/mpv/"

# ── Package lists ──────────────────────────────────────────────────────────────
apt-mark showmanual                           > "$DOTFILES_DIR/packages/apt.txt"
snap list | awk 'NR>1 {print $1}'            > "$DOTFILES_DIR/packages/snap.txt"
flatpak list --app --columns=application     > "$DOTFILES_DIR/packages/flatpak.txt"
brew list 2>/dev/null                        > "$DOTFILES_DIR/packages/brew.txt" || true

# ── GNOME settings ─────────────────────────────────────────────────────────────
dconf dump /org/gnome/shell/extensions/                    > "$DOTFILES_DIR/gnome/extensions.dconf"
dconf dump /org/gnome/desktop/interface/                   > "$DOTFILES_DIR/gnome/interface.dconf"
dconf dump /org/gnome/shell/                               > "$DOTFILES_DIR/gnome/shell.dconf"
dconf dump /org/gnome/settings-daemon/plugins/media-keys/  > "$DOTFILES_DIR/gnome/keybindings.dconf"
dconf dump /org/gnome/desktop/wm/keybindings/             >> "$DOTFILES_DIR/gnome/keybindings.dconf"
gnome-extensions list --enabled                            > "$DOTFILES_DIR/gnome/enabled-extensions.txt"

log "Configs exported."

# ── Git commit & push ──────────────────────────────────────────────────────────
cd "$DOTFILES_DIR"

if git diff --quiet && git diff --cached --quiet; then
  log "No changes to commit."
  exit 0
fi

git add -A
git commit -m "chore: auto-backup $(date '+%Y-%m-%d %H:%M')"
git push origin main

log "Pushed to GitHub. Backup complete."
