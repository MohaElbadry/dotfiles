#!/usr/bin/env bash
# Cron entry point — loads nvm then calls the dots CLI
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
exec dots backup
