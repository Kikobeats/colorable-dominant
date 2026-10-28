'use strict'

const fs = require('fs')
const path = require('path')
const should = require('should')

const root = path.join(__dirname, '..')

describe('dependency build approval', () => {
  it('approves build scripts only for the packages pnpm would otherwise ignore', () => {
    const workspace = fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8')
    const expected = ['allowBuilds:', '  simple-git-hooks: true', '  spawn-sync: true', ''].join(
      '\n'
    )

    should(workspace).equal(expected)
  })

  it('installs with pnpm and skips git hooks without allowing every build', () => {
    const workflow = fs.readFileSync(path.join(root, '.github/workflows/main.yml'), 'utf8')

    should(workflow).not.match(/dangerously_allow_all_builds/)
    should(workflow).not.match(/run_install/)
    should(workflow).match(/^ {6}- name: Install\n {8}run: pnpm install$/m)
    should(workflow).match(/^env:\n {2}SKIP_INSTALL_SIMPLE_GIT_HOOKS: true$/m)
  })

  it('ignores the lockfile pnpm install writes', () => {
    const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8')

    should(gitignore).match(/^pnpm-lock\.yaml$/m)
  })
})
