import { execa } from 'execa'
import { log } from './logger.js'

export async function run(cmd, args = [], opts = {}) {
  try {
    const result = await execa(cmd, args, {
      stdout: 'pipe',
      stderr: 'pipe',
      ...opts,
    })
    return { ok: true, stdout: result.stdout, stderr: result.stderr }
  } catch (err) {
    return { ok: false, stdout: err.stdout || '', stderr: err.stderr || err.message }
  }
}

// Streams output live to terminal (for long-running installs)
export async function runLive(cmd, args = [], opts = {}) {
  try {
    await execa(cmd, args, {
      stdout: 'inherit',
      stderr: 'inherit',
      ...opts,
    })
    return true
  } catch {
    return false
  }
}

// Run a shell string (for complex commands with pipes)
export async function sh(command, opts = {}) {
  try {
    const result = await execa('bash', ['-c', command], {
      stdout: 'pipe',
      stderr: 'pipe',
      ...opts,
    })
    return { ok: true, stdout: result.stdout.trim(), stderr: result.stderr.trim() }
  } catch (err) {
    return { ok: false, stdout: (err.stdout || '').trim(), stderr: (err.stderr || err.message).trim() }
  }
}

// Like sh but streams output
export async function shLive(command, opts = {}) {
  try {
    await execa('bash', ['-c', command], {
      stdout: 'inherit',
      stderr: 'inherit',
      ...opts,
    })
    return true
  } catch {
    return false
  }
}
