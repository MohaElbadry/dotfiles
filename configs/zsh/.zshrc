export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="gnzh"

plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    zsh-completions
    history-substring-search
    zsh-z
    fzf-zsh-plugin
    extract
    fzf
)

# compinit with cache — only regenerate dump once per day
autoload -Uz compinit
if [[ -n $HOME/.zcompdump(#qN.mh+24) ]]; then
  compinit
else
  compinit -C
fi

source $ZSH/oh-my-zsh.sh

# Load topic configs
for f in ~/.config/zsh/*.zsh; do source "$f"; done
