# ElBadry's Dotfiles

Personal configuration for **Ubuntu GNOME** — auto-backed up daily to GitHub.

---

## What's Inside

| Folder | Contents |
|--------|----------|
| `configs/zsh/` | `.zshrc`, `.profile` (Oh My Zsh, gnzh theme) |
| `configs/bash/` | `.bashrc` |
| `configs/nvim/` | Full LazyVim config |
| `configs/fish/` | Fish shell config, functions, completions |
| `configs/kitty/` | Kitty terminal config |
| `configs/lf/` | lf file manager + preview/cleaner scripts |
| `configs/neofetch/` | Neofetch config |
| `configs/gtk/` | GTK3/GTK4 theme settings (WhiteSur-Light) |
| `configs/gh/` | GitHub CLI config |
| `configs/mpv/` | mpv config |
| `gnome/` | GNOME extensions, keybindings, interface (dconf dumps) |
| `packages/` | Package lists: apt, snap, flatpak, brew |
| `scripts/` | backup, install, import-gnome scripts |

## GNOME Setup

- **Theme:** WhiteSur-Light (GTK + Icons)
- **Taskbar:** Dash to Panel (bottom, Windows-style)
- **Key Extensions:** Blur My Shell, Dash to Panel, Tiling Assistant, Clipboard History, Compiz Magic Lamp

---

## Fresh Machine Setup (One Command)

### Prerequisites
```bash
sudo apt install -y git curl
git clone https://github.com/MohaElbadry/dotfiles.git ~/dotfiles
```

### Run the installer
```bash
bash ~/dotfiles/scripts/install.sh
```

This will:
1. Update the system
2. Install all APT, Snap, Flatpak, and Brew packages
3. Install Oh My Zsh
4. Install WhiteSur theme + icons
5. Install GNOME extensions
6. Apply all configs (shell, editors, terminal, file managers)
7. Restore GNOME settings (Dash to Panel, keybindings, theme)
8. Install Claude Code (`claude` CLI)
9. Set up the daily 2:00 AM auto-backup cron job

### After install
```bash
# Log out and back in, then authenticate GitHub CLI:
gh auth login

# Run Claude Code:
claude
```

---

## Manual Restore (step by step)

```bash
# Configs only
cp ~/dotfiles/configs/zsh/.zshrc ~/.zshrc
cp -r ~/dotfiles/configs/nvim/. ~/.config/nvim/
# ... see install.sh for full list

# GNOME settings only
bash ~/dotfiles/scripts/import-gnome.sh
```

---

## Auto-Backup

A cron job runs every day at **2:00 AM** and:
- Exports all configs & package lists
- Exports GNOME dconf settings
- Commits changes to git
- Pushes to this GitHub repo

Set up manually:
```bash
crontab -e
# Add this line:
0 2 * * * ~/dotfiles/scripts/backup.sh >> ~/dotfiles/.backup.log 2>&1
```

Check backup logs:
```bash
tail -f ~/dotfiles/.backup.log
```

Force a manual backup:
```bash
bash ~/dotfiles/scripts/backup.sh
```

---

## Adding New Configs

1. Add the copy line to `scripts/backup.sh` (export section)
2. Add the restore line to `scripts/install.sh` (apply configs section)
3. Run a manual backup to include it immediately
