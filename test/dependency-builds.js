'use strict'

const fs = require('fs')
const path = require('path')
const should = require('should')

const root = path.join(__dirname, '..')

function normalizeNewlines (value) {
  return value.replace(/\r\n/g, '\n')
}

function readText (name) {
  return normalizeNewlines(fs.readFileSync(path.join(root, name), 'utf8'))
}

describe('dependency build approval', () => {
  const expected = `allowBuilds:
  simple-git-hooks: true
  spawn-sync: true
`

  it('approves build scripts only for the packages pnpm would otherwise ignore', () => {
    should(readText('pnpm-workspace.yaml')).equal(expected)
  })

  it('installs with pnpm and skips git hooks without allowing every build', () => {
    const workflow = readText('.github/workflows/main.yml')

    should(workflow).not.match(/dangerously_allow_all_builds/)
    should(workflow).not.match(/run_install/)
    should(workflow).match(/^ {6}- name: Install\n {8}run: pnpm install$/m)
    should(workflow).match(/^env:\n {2}SKIP_INSTALL_SIMPLE_GIT_HOOKS: true$/m)
  })

  it('ignores the lockfile pnpm install writes', () => {
    should(readText('.gitignore')).match(/^pnpm-lock\.yaml$/m)
  })

  it('accepts a CRLF checkout of the install policy', () => {
    const files = [
      'pnpm-workspace.yaml',
      '.github/workflows/main.yml',
      '.gitignore'
    ]
    const original = {}

    for (const name of files) {
      original[name] = fs.readFileSync(path.join(root, name))
    }

    try {
      for (const name of files) {
        const lf = original[name].toString('utf8').replace(/\r\n/g, '\n')
        fs.writeFileSync(path.join(root, name), lf.replace(/\n/g, '\r\n'))
      }

      should(readText('pnpm-workspace.yaml')).equal(expected)
      const workflow = readText('.github/workflows/main.yml')
      should(workflow).match(/^ {6}- name: Install\n {8}run: pnpm install$/m)
      should(workflow).match(/^env:\n {2}SKIP_INSTALL_SIMPLE_GIT_HOOKS: true$/m)
      should(readText('.gitignore')).match(/^pnpm-lock\.yaml$/m)
    } finally {
      for (const name of files) {
        fs.writeFileSync(path.join(root, name), original[name])
      }
    }
  })
})
