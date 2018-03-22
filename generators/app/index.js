const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const fetch = require('isomorphic-fetch')

module.exports = class extends Generator {
  prompting() {
    this.log(
      yosay(
        `Welcome to the ${chalk.green('generator-es-inifinity')} generator!`,
      ),
    )

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
        name: 'includeWebpack',
        message: 'Would you like to install webpack?',
        default: true,
      },
    ]

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  async writing() {
    const fetchVersion = async (url, options = {}) => {
      const { peers, tag = 'latest', name } = options
      const res = await fetch(`https://registry.npmjs.org/${url}/${tag}`)
      const { version, peerDependencies } = await res.json()

      const lib = {
        [name || url]: `^${version}`,
      }
      return peers ? { ...lib, ...peerDependencies } : lib
    }

    const copyFile = (source, destination = source) => {
      this.fs.copy(this.templatePath(source), this.destinationPath(destination))
    }

    const libs = [
      await fetchVersion('babel-preset-env'),
      await fetchVersion('babel-cli'),
      await fetchVersion('babel-eslint'),
      await fetchVersion('eslint-config-airbnb', { peers: true }),
      await fetchVersion('eslint-config-prettier'),
      await fetchVersion('eslint-plugin-prettier'),
      await fetchVersion('eslint-plugin-jest'),
      await fetchVersion('husky'),
      await fetchVersion('jest'),
      await fetchVersion('lint-staged'),
      await fetchVersion('prettier'),
    ]

    if (this.props.includeWebpack) {
      libs.shift()

      const webpackLibs = [
        await fetchVersion('babel-core', { name: '@babel/core', tag: 'next' }),
        await fetchVersion('babel-preset-env', {
          name: '@babel/preset-env',
          tag: 'next',
        }),
        await fetchVersion('babel-preset-react', {
          name: '@babel/preset-react',
          tag: 'next',
        }),
        await fetchVersion('babel-loader', { tag: 'next' }),
        await fetchVersion('css-loader'),
        await fetchVersion('extract-text-webpack-plugin', { tag: 'next' }),
        await fetchVersion('file-loader'),
        await fetchVersion('node-sass'),
        await fetchVersion('postcss-cssnext'),
        await fetchVersion('postcss-import'),
        await fetchVersion('postcss-loader'),
        await fetchVersion('react'),
        await fetchVersion('react-dom'),
        await fetchVersion('sass-loader'),
        await fetchVersion('webpack'),
        await fetchVersion('webpack-cli'),
        await fetchVersion('style-loader'),
      ]
      libs.push(...webpackLibs)
    }

    const devDependencyArray = await Promise.all(libs)

    const devDependencies = devDependencyArray.reduce(
      (m, c) => ({ ...m, ...c }),
      {},
    )

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
    copyFile('.prettierignore')
    copyFile('webpack.config.js')
    copyFile('postcss.config.js')

    this.fs.copyTpl(
      this.templatePath('.nvmrc'),
      this.destinationPath('.nvmrc'),
      {
        nodeVersion: this.props.nodeVersion,
      },
    )
  }

  install() {
    this.yarnInstall()
  }

  end() {
    this.spawnCommandSync('git', ['init'])
  }
}
