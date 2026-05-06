#!/usr/bin/env bash
# Bootstrap a fresh Ubuntu GNOME machine from this dotfiles repo
# Usage: bash install.sh

set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GITHUB_USER="MohaElbadry"

green()  { echo -e "\033[32m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }
red()    { echo -e "\033[31m$*\033[0m"; }
step()   { echo; green "══════════════════════════════════════"; green " $*"; green "══════════════════════════════════════"; }

# ── 1. System update ───────────────────────────────────────────────────────────
step "1/10 Updating system"
sudo apt update && sudo apt upgrade -y

# ── 2. APT packages ───────────────────────────────────────────────────────────
step "2/10 Installing APT packages"
# Core tools needed before the rest
sudo apt install -y curl git zsh wget gnupg ca-certificates software-properties-common

# Install packages from list (skip ones that fail — meta/virtual packages)
while IFS= read -r pkg; do
  sudo apt install -y "$pkg" 2>/dev/null || yellow "  skipped: $pkg"
done < "$DOTFILES_DIR/packages/apt.txt"

# ── 3. Oh My Zsh ──────────────────────────────────────────────────────────────
step "3/10 Installing Oh My Zsh"
if [ ! -d "$HOME/.oh-my-zsh" ]; then
  RUNZSH=no CHSH=no sh -c \
    "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
fi
chsh -s "$(which zsh)"

# ── 4. Snap packages ──────────────────────────────────────────────────────────
step "4/10 Installing Snap packages"
while IFS= read -r pkg; do
  case "$pkg" in
    code)          sudo snap install code --classic ;;
    obsidian)      sudo snap install obsidian --classic ;;
    intellij*)     sudo snap install intellij-idea-ultimate --classic ;;
    *)             sudo snap install "$pkg" 2>/dev/null || yellow "  skipped snap: $pkg" ;;
  esac
done < "$DOTFILES_DIR/packages/snap.txt"

# ── 5. Flatpak ────────────────────────────────────────────────────────────────
step "5/10 Installing Flatpak apps"
sudo apt install -y flatpak
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
while IFS= read -r app; do
  flatpak install -y flathub "$app" 2>/dev/null || yellow "  skipped flatpak: $app"
done < "$DOTFILES_DIR/packages/flatpak.txt"

# ── 6. Homebrew + brew packages ───────────────────────────────────────────────
step "6/10 Installing Homebrew + packages"
if ! command -v brew &>/dev/null; then
  NONINTERACTIVE=1 /bin/bash -c \
    "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
fi
while IFS= read -r pkg; do
  brew install "$pkg" 2>/dev/null || yellow "  skipped brew: $pkg"
done < "$DOTFILES_DIR/packages/brew.txt"

# ── 7. WhiteSur GTK theme ─────────────────────────────────────────────────────
step "7/10 Installing WhiteSur theme"
if [ ! -d /usr/share/themes/WhiteSur-Light ]; then
  TMP_THEME=$(mktemp -d)
  git clone https://github.com/vinceliuice/WhiteSur-gtk-theme.git "$TMP_THEME/whitesur"
  bash "$TMP_THEME/whitesur/install.sh" -t all -l --normal
  rm -rf "$TMP_THEME"
fi

if [ ! -d /usr/share/icons/WhiteSur-light ]; then
  TMP_ICONS=$(mktemp -d)
  git clone https://github.com/vinceliuice/WhiteSur-icon-theme.git "$TMP_ICONS/whitesur-icons"
  bash "$TMP_ICONS/whitesur-icons/install.sh"
  rm -rf "$TMP_ICONS"
fi

# ── 8. GNOME extensions ───────────────────────────────────────────────────────
step "8/10 Installing GNOME extensions"
sudo apt install -y gnome-shell-extension-manager gnome-tweaks 2>/dev/null || true

yellow "Installing extensions via extension manager..."
# Install key extensions by UUID using gnome-extensions CLI (where available)
# or guide the user to install manually
EXTENSIONS=(
  "blur-my-shell@aunetx"
  "dash-to-panel@jderose9.github.com"
  "compiz-alike-magic-lamp-effect@hermes83.github.com"
  "clipboard-history@alexsaveau.dev"
  "tiling-assistant@ubuntu.com"
  "system-monitor@gnome-shell-extensions.gcampax.github.com"
  "places-menu@gnome-shell-extensions.gcampax.github.com"
)

# Try installing via gext tool if available
if command -v pip3 &>/dev/null; then
  pip3 install gnome-extensions-cli --break-system-packages 2>/dev/null || true
fi

if command -v gext &>/dev/null; then
  for ext in "${EXTENSIONS[@]}"; do
    gext install "$ext" 2>/dev/null || yellow "  manual install needed: $ext"
  done
else
  yellow "  Install these extensions manually from https://extensions.gnome.org:"
  for ext in "${EXTENSIONS[@]}"; do
    echo "    - $ext"
  done
fi

# ── 9. Apply configs ───────────────────────────────────────────────────────────
step "9/10 Applying dotfile configs"
mkdir -p \
  ~/.config/nvim \
  ~/.config/fish \
  ~/.config/lf \
  ~/.config/neofetch \
  ~/.config/kitty \
  ~/.config/mpv \
  ~/.config/gtk-3.0 \
  ~/.config/gtk-4.0 \
  ~/.config/gh

cp "$DOTFILES_DIR/configs/zsh/.zshrc"         ~/.zshrc
cp "$DOTFILES_DIR/configs/zsh/.profile"       ~/.profile
cp "$DOTFILES_DIR/configs/bash/.bashrc"       ~/.bashrc
cp -r "$DOTFILES_DIR/configs/nvim/." ~/.config/nvim/
cp -r "$DOTFILES_DIR/configs/fish/." ~/.config/fish/
cp -r "$DOTFILES_DIR/configs/lf/."   ~/.config/lf/
cp "$DOTFILES_DIR/configs/neofetch/config.conf" ~/.config/neofetch/
[ -f "$DOTFILES_DIR/configs/gtk/gtk3-settings.ini" ] && \
  cp "$DOTFILES_DIR/configs/gtk/gtk3-settings.ini" ~/.config/gtk-3.0/settings.ini
[ -f "$DOTFILES_DIR/configs/gtk/gtk4-settings.ini" ] && \
  cp "$DOTFILES_DIR/configs/gtk/gtk4-settings.ini" ~/.config/gtk-4.0/settings.ini
[ -n "$(ls -A "$DOTFILES_DIR/configs/kitty/" 2>/dev/null)" ] && \
  cp -r "$DOTFILES_DIR/configs/kitty/." ~/.config/kitty/
[ -n "$(ls -A "$DOTFILES_DIR/configs/mpv/" 2>/dev/null)" ] && \
  cp -r "$DOTFILES_DIR/configs/mpv/." ~/.config/mpv/

# Restore GNOME settings
bash "$DOTFILES_DIR/scripts/import-gnome.sh"

# ── FiraCode font (used by lf) ────────────────────────────────────────────────
mkdir -p ~/.local/share/fonts
FIRACODE_URL="https://github.com/tonsky/FiraCode/releases/download/6.2/Fira_Code_v6.2.zip"
TMP_FONT=$(mktemp -d)
curl -L "$FIRACODE_URL" -o "$TMP_FONT/FiraCode.zip"
unzip -q "$TMP_FONT/FiraCode.zip" -d "$TMP_FONT/firacode"
cp "$TMP_FONT/firacode/ttf/"*.ttf ~/.local/share/fonts/
fc-cache -f
rm -rf "$TMP_FONT"

# ── 10. Claude Code ───────────────────────────────────────────────────────────
step "10/10 Installing Claude Code"
if ! command -v claude &>/dev/null; then
  npm install -g @anthropic-ai/claude-code 2>/dev/null || \
  sudo npm install -g @anthropic-ai/claude-code
fi

# Set up daily backup cron
step "Setting up daily backup cron"
CRON_CMD="0 2 * * * $DOTFILES_DIR/scripts/backup.sh >> $DOTFILES_DIR/.backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_CMD") | crontab -

green ""
green "✓ Setup complete! Log out and back in for all changes to take effect."
green "  Your dotfiles will auto-backup daily at 2:00 AM to GitHub."
