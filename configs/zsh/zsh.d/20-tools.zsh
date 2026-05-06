# Homebrew
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

# mise (runtime version manager — replaces nvm)
if command -v mise &>/dev/null; then
  eval "$(mise activate zsh)"
else
  # Fallback to nvm if mise not installed yet
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion"
fi

# atuin (shell history)
[ -f "$HOME/.atuin/bin/env" ] && source "$HOME/.atuin/bin/env"
command -v atuin &>/dev/null && eval "$(atuin init zsh)"

# Docker
export DOCKER_HOST=unix:///var/run/docker.sock
