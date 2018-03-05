'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const fetch = require('isomorphic-fetch')

module.exports = class extends Generator {
  prompting() {
    this.log(yosay(`Welcome to the ${chalk.green('generator-es-inifinity')} generator!`))

    const prompts = [
      {
        type: 'input',
        name: 'nodeVersion',
        message: 'Which version of node would you like to use?',
        default: '8.9.4',
      },
      {
        type: 'input',
        name: 'pkgName',
        message: 'What would you like to call this package?',
        default: '',
      },
      {
        type: 'confirm',
        name: 'webpack',
        message: 'Would you like to install webpack?',
        default: true,
      },
    ]

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  async writing() {
    const fetchVersion = async (url, peers) => {
      const res = await fetch(`https://registry.npmjs.org/${url}/latest`)
      const { version, peerDependencies } = await res.json()

      const lib = {
        [url]: `^${version}`,
      }
      return peers ? { ...lib, ...peerDependencies } : lib
    }

    const copyFile = (source, destination = source) => {
      this.fs.copy(this.templatePath(source), this.destinationPath(destination))
    }

    const devDependencyArray = await Promise.all([
      await fetchVersion('prettier'),
      await fetchVersion('babel-cli'),
      await fetchVersion('babel-eslint'),
      await fetchVersion('eslint-config-airbnb', true),
      await fetchVersion('jest'),
      await fetchVersion('babel-preset-env'),
      await fetchVersion('husky'),
      await fetchVersion('lint-staged'),
      await fetchVersion('eslint-config-prettier'),
      await fetchVersion('jest'),
      await fetchVersion('eslint-plugin-jest'),
    ])

    const devDependencies = devDependencyArray.reduce((m, c) => ({ ...m, ...c }), {})

    const pkg = {
      name: this.props.input,
      version: '1.0.0',
      main: 'index.js',
      license: 'MIT',
      scripts: {
        precommit: 'lint-staged',
      },
      'lint-staged': {
        '*.{js,json,css,md}': ['prettier --write', 'git add'],
      },
      dependencies: {},
      devDependencies,
    }

    this.fs.writeJSON(this.destinationPath('package.json'), pkg)

    copyFile('.editorconfig')
    copyFile('.eslintrc')
    copyFile('.gitignore')
    copyFile('.prettierrc.js')

    this.fs.copyTpl(this.templatePath('.nvmrc'), this.destinationPath('.nvmrc'), {
      nodeVersion: this.props.nodeVersion,
    })
  }

  install() {
    // This.yarnInstall()
  }
}
