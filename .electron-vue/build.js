'use strict'

process.env.NODE_ENV = 'production'

const { say } = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const { spawn } = require('child_process')
const webpack = require('webpack')
const Listr = require('listr')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

if (process.env.BUILD_TARGET === 'clean') clean()
else build()

function clean() {
  del.sync(['build/*', '!build/icons', '!build/icons/icon.*', '!build/sounds', '!build/sounds/*', '!build/notarize.js'])
  del.sync(['packages/*'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

async function build() {
  del.sync(['dist/electron/*', '!.gitkeep'])

  let results = ''

  const tasks = new Listr(
    [
      {
        title: 'building master process',
        task: async () => {
          await pack(mainConfig).catch(err => {
            console.log(`\n  ${errorLog}failed to build main process`)
            console.error(`\n${err}\n`)
          })
        }
      },
      {
        title: 'building renderer process',
        task: async () => {
          await pack(rendererConfig).catch(err => {
            console.log(`\n  ${errorLog}failed to build renderer process`)
            console.error(`\n${err}\n`)
          })
        }
      }
    ],
    { concurrent: 2 }
  )

  await tasks
    .run()
    .then(() => {
      process.stdout.write('\x1B[2J\x1B[0f')
      console.log(`\n\n${results}`)
      process.exit()
    })
    .catch(err => {
      process.exit(1)
    })
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
        resolve(null)
      }
    })
  })
}
