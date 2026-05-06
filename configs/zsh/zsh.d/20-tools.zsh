mkdir -p "$HOME/.cache"

# Homebrew — cache shellenv to file, regenerate only when brew binary changes
_brew_cache="$HOME/.cache/brew-shellenv.sh"
if [[ ! -f "$_brew_cache" || /home/linuxbrew/.linuxbrew/bin/brew -nt "$_brew_cache" ]]; then
  /home/linuxbrew/.linuxbrew/bin/brew shellenv > "$_brew_cache"
fi
source "$_brew_cache"
unset _brew_cache

# mise — cache activate output, regenerate only when mise binary changes
_mise_cache="$HOME/.cache/mise-init.zsh"
if [[ ! -f "$_mise_cache" || "$HOME/.local/bin/mise" -nt "$_mise_cache" ]]; then
  "$HOME/.local/bin/mise" activate zsh > "$_mise_cache" 2>/dev/null
fi
source "$_mise_cache"
unset _mise_cache

# atuin — cache init output, regenerate only when atuin binary changes
_atuin_cache="$HOME/.cache/atuin-init.zsh"
if [[ ! -f "$_atuin_cache" || "$HOME/.atuin/bin/atuin" -nt "$_atuin_cache" ]]; then
  source "$HOME/.atuin/bin/env" 2>/dev/null
  "$HOME/.atuin/bin/atuin" init zsh > "$_atuin_cache" 2>/dev/null
fi
source "$HOME/.atuin/bin/env" 2>/dev/null
source "$_atuin_cache"
unset _atuin_cache

# Docker
export DOCKER_HOST=unix:///var/run/docker.sock
