import chalk from 'chalk'

export const log = {
  info:    (msg) => console.log(chalk.cyan('  →'), msg),
  success: (msg) => console.log(chalk.green('  ✓'), msg),
  warn:    (msg) => console.log(chalk.yellow('  ⚠'), msg),
  error:   (msg) => console.log(chalk.red('  ✗'), msg),
  step:    (msg) => console.log('\n' + chalk.bold.white(`  ${msg}`)),
  dim:     (msg) => console.log(chalk.dim(`    ${msg}`)),
  blank:   ()    => console.log(),
}

export function banner(title) {
  const line = '─'.repeat(50)
  console.log('\n' + chalk.bold.blue(line))
  console.log(chalk.bold.white(`  ${title}`))
  console.log(chalk.bold.blue(line) + '\n')
}
