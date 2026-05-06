#!/usr/bin/env bash
# Restore GNOME settings from dconf dumps

set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Restoring GNOME settings..."

dconf load /org/gnome/shell/extensions/                   < "$DOTFILES_DIR/gnome/extensions.dconf"
dconf load /org/gnome/desktop/interface/                  < "$DOTFILES_DIR/gnome/interface.dconf"
dconf load /org/gnome/shell/                              < "$DOTFILES_DIR/gnome/shell.dconf"
dconf load /org/gnome/settings-daemon/plugins/media-keys/ < "$DOTFILES_DIR/gnome/keybindings.dconf"

# Apply theme via gsettings explicitly
gsettings set org.gnome.desktop.interface gtk-theme      'WhiteSur-Light'
gsettings set org.gnome.desktop.interface icon-theme     'WhiteSur-light'
gsettings set org.gnome.desktop.interface color-scheme   'prefer-dark'

echo "GNOME settings restored."
echo "Note: You may need to log out and back in for extension changes to take effect."
