'use strict'

process.env.NODE_ENV = 'production'

const { say } = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const { spawn } = require('child_process')
const webpack = require('webpack')
const ora = require('ora')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')
const webConfig = require('./webpack.web.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

if (process.env.BUILD_TARGET === 'clean') clean()
else if (process.env.BUILD_TARGET === 'web') web()
else build()

function clean() {
  del.sync(['build/*', '!build/icons', '!build/icons/icon.*', '!build/sounds', '!build/sounds/*'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

async function build() {
  greeting()

  del.sync(['dist/electron/*', '!.gitkeep'])

  let results = ''

  const mainSpinner = ora({
    prefixText: 'building',
    text: 'processing'
  })
  const rendererSpinner = ora({
    prefixText: 'building',
    text: 'processing'
  })

  mainSpinner.start()
  rendererSpinner.start()

  const main = pack(mainConfig)
    .then(result => {
      results += result + '\n\n'
      mainSpinner.succeed()
    })
    .catch(err => {
      mainSpinner.fail()
      console.log(`\n  ${errorLog}failed to build main process`)
      console.error(`\n${err}\n`)
      process.exit(1)
    })

  const renderer = pack(rendererConfig)
    .then(result => {
      results += result + '\n\n'
      rendererSpinner.succeed()
    })
    .catch(err => {
      rendererSpinner.fail()
      console.log(`\n  ${errorLog}failed to build renderer process`)
      console.error(`\n${err}\n`)
      process.exit(1)
    })
  await Promise.all([main, renderer])
  process.stdout.write('\x1B[2J\x1B[0f')
  console.log(`\n\n${results}`)
  console.log(`${okayLog}take it away ${chalk.yellow('`electron-builder`')}\n`)
  process.exit()
}

function pack(config) {
  return new Promise((resolve, reject) => {
    config.mode = 'production'
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats
          .toString({
            chunks: false,
            colors: true
          })
          .split(/\r?\n/)
          .forEach(line => {
            err += `    ${line}\n`
          })

        reject(err)
      } else {
        resolve(
          stats.toString({
            chunks: false,
            colors: true
          })
        )
      }
    })
  })
}

function web() {
  del.sync(['dist/web/*', '!.gitkeep'])
  webConfig.mode = 'production'
  webpack(webConfig, (err, stats) => {
    if (err || stats.hasErrors()) console.log(err)

    console.log(
      stats.toString({
        chunks: false,
        colors: true
      })
    )

    process.exit()
  })
}

function greeting() {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 85) text = 'lets-build'
  else if (cols > 60) text = 'lets-|build'
  else text = false

  if (text && !isCI) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  lets-build'))
  console.log()
}
