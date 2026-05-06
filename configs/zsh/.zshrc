export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="gnzh"

plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    zsh-completions
    history-substring-search
    alias-tips
    zsh-z
    zsh-interactive-cd
    fzf-zsh-plugin
    extract
    autojump
    fzf
    vscode
    web-search
)

autoload -U compinit && compinit
source $ZSH/oh-my-zsh.sh

# Load topic configs
for f in ~/.config/zsh/*.zsh; do source "$f"; done
