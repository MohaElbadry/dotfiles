import { resolve } from 'path'
import { homedir } from 'os'

const HOME = homedir()
const DOTFILES = resolve(import.meta.dirname, '../..')

export const PATHS = {
  home: HOME,
  dotfiles: DOTFILES,

  configs: {
    zshrc:        `${HOME}/.zshrc`,
    bashrc:       `${HOME}/.bashrc`,
    profile:      `${HOME}/.profile`,
    gitconfig:    `${HOME}/.gitconfig`,
    nvim:         `${HOME}/.config/nvim`,
    fish:         `${HOME}/.config/fish`,
    kitty:        `${HOME}/.config/kitty`,
    lf:           `${HOME}/.config/lf`,
    neofetch:     `${HOME}/.config/neofetch`,
    gtk3:         `${HOME}/.config/gtk-3.0/settings.ini`,
    gtk4:         `${HOME}/.config/gtk-4.0/settings.ini`,
    gh:           `${HOME}/.config/gh/config.yml`,
    mpv:          `${HOME}/.config/mpv`,
    spicetify:    `${HOME}/.config/spicetify`,
    zed:          `${HOME}/.config/zed/settings.json`,
    autostart:    `${HOME}/.config/autostart`,
    omzPlugins:   `${HOME}/.oh-my-zsh/custom/plugins`,
    zshd:         `${HOME}/.config/zsh`,
    mise:         `${HOME}/.config/mise/config.toml`,
    yazi:         `${HOME}/.config/yazi`,
    atuin:        `${HOME}/.config/atuin`,
    fontconfig:   `${HOME}/.config/fontconfig`,
  },

  backup: {
    zshrc:        `${DOTFILES}/configs/zsh/.zshrc`,
    bashrc:       `${DOTFILES}/configs/bash/.bashrc`,
    profile:      `${DOTFILES}/configs/zsh/.profile`,
    gitconfig:    `${DOTFILES}/configs/git/.gitconfig`,
    nvim:         `${DOTFILES}/configs/nvim`,
    fish:         `${DOTFILES}/configs/fish`,
    kitty:        `${DOTFILES}/configs/kitty`,
    lf:           `${DOTFILES}/configs/lf`,
    neofetch:     `${DOTFILES}/configs/neofetch`,
    gtk3:         `${DOTFILES}/configs/gtk/gtk3-settings.ini`,
    gtk4:         `${DOTFILES}/configs/gtk/gtk4-settings.ini`,
    gh:           `${DOTFILES}/configs/gh/config.yml`,
    mpv:          `${DOTFILES}/configs/mpv`,
    spicetify:    `${DOTFILES}/configs/spicetify`,
    zed:          `${DOTFILES}/configs/zed/settings.json`,
    autostart:    `${DOTFILES}/configs/autostart`,
    omzPlugins:   `${DOTFILES}/configs/zsh/omz-plugins.json`,
    gnomeExt:     `${DOTFILES}/gnome/extensions.dconf`,
    gnomeIface:   `${DOTFILES}/gnome/interface.dconf`,
    gnomeShell:   `${DOTFILES}/gnome/shell.dconf`,
    gnomeKeys:    `${DOTFILES}/gnome/keybindings.dconf`,
    gnomeEnabled: `${DOTFILES}/gnome/enabled-extensions.txt`,
    zshd:         `${DOTFILES}/configs/zsh/zsh.d`,
    mise:         `${DOTFILES}/configs/mise/config.toml`,
    yazi:         `${DOTFILES}/configs/yazi`,
    atuin:        `${DOTFILES}/configs/atuin`,
    fontconfig:   `${DOTFILES}/configs/fontconfig`,
    pkgApt:       `${DOTFILES}/packages/apt.txt`,
    pkgSnap:      `${DOTFILES}/packages/snap.txt`,
    pkgFlatpak:   `${DOTFILES}/packages/flatpak.txt`,
    pkgBrew:      `${DOTFILES}/packages/brew.txt`,
  }
}
