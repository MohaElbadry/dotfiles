#!/usr/bin/env node
import chalk from 'chalk'
import enquirer from 'enquirer'
import { backup }  from './commands/backup.js'
import { status }  from './commands/status.js'
import { install } from './commands/install.js'

const { Select } = enquirer
const arg = process.argv[2]

// Non-interactive mode (called by cron)
if (arg === 'backup')  { await backup({ interactive: false }); process.exit(0) }
if (arg === 'status')  { await status(); process.exit(0) }
if (arg === 'install') { await install(); process.exit(0) }

// Interactive main menu

console.log('\n' + chalk.bold.blue('  ██████╗  ██████╗ ████████╗███████╗'))
console.log(        chalk.bold.blue('  ██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝'))
console.log(        chalk.bold.blue('  ██║  ██║██║   ██║   ██║   ███████╗'))
console.log(        chalk.bold.blue('  ██║  ██║██║   ██║   ██║   ╚════██║'))
console.log(        chalk.bold.blue('  ██████╔╝╚██████╔╝   ██║   ███████║'))
console.log(        chalk.bold.blue('  ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝'))
console.log('\n' +  chalk.dim('  ElBadry dotfiles — backup · restore · install\n'))

const action = await new Select({
  name: 'action',
  message: 'What do you want to do?',
  choices: [
    { name: 'backup',  message: '  Backup now         — export configs + push to GitHub' },
    { name: 'status',  message: '  Status             — show what changed since last backup' },
    { name: 'install', message: '  Install / Restore  — set up this machine from backup' },
    { name: 'exit',    message: '  Exit' },
  ],
}).run().catch(() => 'exit')

if (action === 'exit') process.exit(0)
if (action === 'backup')  await backup({ interactive: true })
if (action === 'status')  await status()
if (action === 'install') await install()
