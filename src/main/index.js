'use strict'

import { app, ipcMain, BrowserWindow, shell, Menu } from 'electron'
import Datastore from 'nedb'
import empty from 'is-empty'
import log from 'electron-log'
import windowStateKeeper from 'electron-window-state'
import simplayer from 'simplayer'
import path from 'path'
import openAboutWindow from 'about-window'

import Authentication from './auth'
import Account from './account'
import Streaming from './streaming'
import Preferences from './preferences'

/**
 * Set log level
 */
log.transports.console.level = 'debug'
log.transports.file.level = 'info'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

// https://github.com/louischatriot/nedb/issues/459
const userData = app.getPath('userData')
const accountDBPath = process.env.NODE_ENV === 'production'
  ? userData + '/db/account.db'
  : 'account.db'
let accountDB = new Datastore({
  filename: accountDBPath,
  autoload: true
})
const preferencesDBPath = process.env.NODE_ENV === 'production'
  ? userData + './db/preferences.json'
  : 'preferences.json'

const soundBasePath = process.env.NODE_ENV === 'development'
  ? path.join(__dirname, '../../build/sounds/')
  : path.join(process.resourcesPath, 'build/sounds/')

async function listAccounts () {
  try {
    const account = new Account(accountDB)
    await account.cleanup()
    const accounts = await account.listAccounts()
    return accounts
  } catch (err) {
    return []
  }
}

function createWindow () {
  /**
   * List accounts
   */
  listAccounts()
    .then((accounts) => {
      const accountsChange = accounts.map((a, index) => {
        return {
          label: a.domain,
          accelerator: `CmdOrCtrl+${index + 1}`,
          click: () => {
            mainWindow.webContents.send('change-account', Object.assign(a, { index: index }))
          }
        }
      })
      /**
       * Set menu
       */
      const template = [
        {
          label: 'Whalebird',
          submenu: [
            {
              label: 'About Whalebird',
              role: 'about',
              click: () => {
                openAboutWindow({
                  icon_path: path.resolve(__dirname, '../../build/icons/256x256.png'),
                  copyright: 'Copyright (c) 2018 AkiraFukushima',
                  package_json_dir: path.resolve(__dirname, '../../'),
                  open_devtools: process.env.NODE_ENV !== 'production'
                })
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Preferences...',
              accelerator: 'CmdOrCtrl+,',
              click: () => {
                mainWindow.webContents.send('open-preferences')
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Quit',
              accelerator: 'CmdOrCtrl+Q',
              role: 'quit'
            }
          ]
        },
        {
          label: 'Toot',
          submenu: [
            {
              label: 'New Toot',
              accelerator: 'CmdOrCtrl+N',
              click: () => {
                mainWindow.webContents.send('CmdOrCtrl+N')
              }
            }
          ]
        },
        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              accelerator: 'CmdOrCtrl+Z',
              role: 'undo'
            },
            {
              label: 'Redo',
              accelerator: 'Shift+CmdOrCtrl+Z',
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              label: 'Cut',
              accelerator: 'CmdOrCtrl+X',
              role: 'cut'
            },
            {
              label: 'Copy',
              accelerator: 'CmdOrCtrl+C',
              role: 'copy'
            },
            {
              label: 'Paste',
              accelerator: 'CmdOrCtrl+V',
              role: 'paste'
            },
            {
              label: 'Select All',
              accelerator: 'CmdOrCtrl+A',
              role: 'selectall'
            }
          ]
        },
        {
          label: 'Window',
          submenu: [
            {
              label: 'Close Window',
              role: 'close'
            },
            {
              label: 'Minimize',
              role: 'minimize'
            },
            {
              type: 'separator'
            }
          ].concat(accountsChange)
            .concat([
              {
                type: 'separator'
              },
              {
                label: 'Jump to',
                accelerator: 'CmdOrCtrl+K',
                click: () => {
                  mainWindow.webContents.send('CmdOrCtrl+K')
                }
              }
            ])
        }
      ]

      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)

      /**
       * Initial window options
       */
      let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        height: 563
      })
      mainWindow = new BrowserWindow({
        titleBarStyle: 'hidden',
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        useContentSize: true,
        icon: path.resolve(__dirname, '../../build/icons/256x256.png')
      })
      mainWindowState.manage(mainWindow)

      mainWindow.loadURL(winURL)

      mainWindow.on('closed', () => {
        mainWindow = null
      })
    })
}

// Do not lower the rendering priority of Chromium when background
app.commandLine.appendSwitch('disable-renderer-backgrounding')

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
  // This is a single-window application.
  // So quit application when main window is closed.
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let auth = new Authentication(new Account(accountDB))

ipcMain.on('get-auth-url', (event, domain) => {
  auth.getAuthorizationUrl(domain)
    .then((url) => {
      log.debug(url)
      event.sender.send('response-get-auth-url', url)
      // Open authorize url in default browser.
      shell.openExternal(url)
    })
    .catch((err) => {
      log.error(err)
      event.sender.send('error-get-auth-url', err)
    })
})

ipcMain.on('get-access-token', (event, code) => {
  auth.getAccessToken(code)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-get-access-token', err)
    })
    .then((token) => {
      accountDB.findOne({
        accessToken: token
      }, (err, doc) => {
        if (err) return event.sender.send('error-get-access-token', err)
        if (empty(doc)) return event.sender.send('error-get-access-token', 'error document is empty')
        event.sender.send('response-get-access-token', doc._id)
      })
    })
})

// environments
ipcMain.on('get-social-token', (event, _) => {
  const token = process.env.SOCIAL_TOKEN
  if (empty(token)) {
    return event.sender.send('error-get-social-token', new EmptyTokenError())
  }
  event.sender.send('response-get-social-token', token)
})

// nedb
ipcMain.on('list-accounts', (event, _) => {
  const account = new Account(accountDB)
  account.listAccounts()
    .catch((err) => {
      log.error(err)
      event.sender.send('error-list-accounts', err)
    })
    .then((accounts) => {
      event.sender.send('response-list-accounts', accounts)
    })
})

ipcMain.on('get-local-account', (event, id) => {
  const account = new Account(accountDB)
  account.getAccount(id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-get-local-account', err)
    })
    .then((account) => {
      event.sender.send('response-get-local-account', account)
    })
})

ipcMain.on('update-account', (event, acct) => {
  const account = new Account(accountDB)
  account.refresh(acct)
    .then((ac) => {
      event.sender.send('response-update-account', ac)
    })
    .catch((err) => {
      event.sender.send('error-update-account', err)
    })
})

ipcMain.on('remove-account', (event, id) => {
  const account = new Account(accountDB)
  account.removeAccount(id)
    .then(() => {
      event.sender.send('response-remove-account')
    })
    .catch((err) => {
      event.sender.send('error-remove-account', err)
    })
})

ipcMain.on('forward-account', (event, acct) => {
  const account = new Account(accountDB)
  account.forwardAccount(acct)
    .then(() => {
      event.sender.send('response-forward-account')
    })
    .catch((err) => {
      event.sender.send('error-forward-account', err)
    })
})

ipcMain.on('backward-account', (event, acct) => {
  const account = new Account(accountDB)
  account.backwardAccount(acct)
    .then(() => {
      event.sender.send('response-backward-account')
    })
    .catch((err) => {
      event.sender.send('error-backward-account', err)
    })
})

ipcMain.on('refresh-accounts', (event, _) => {
  const account = new Account(accountDB)
  account.refreshAccounts()
    .then((accounts) => {
      event.sender.send('response-refresh-accounts', accounts)
    })
    .catch((err) => {
      event.sender.send('error-refresh-accounts', err)
    })
})

// streaming
let userStreaming = null

ipcMain.on('start-user-streaming', (event, ac) => {
  const account = new Account(accountDB)
  account.getAccount(ac._id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-start-user-streaming', err)
    })
    .then((account) => {
      // Stop old user streaming
      if (userStreaming !== null) {
        userStreaming.stop()
        userStreaming = null
      }

      userStreaming = new Streaming(account)
      userStreaming.startUserStreaming(
        (update) => {
          event.sender.send('update-start-user-streaming', update)
        },
        (notification) => {
          event.sender.send('notification-start-user-streaming', notification)
        },
        (err) => {
          log.error(err)
          event.sender.send('error-start-user-streaming', err)
        }
      )
    })
})

ipcMain.on('stop-user-streaming', (event, _) => {
  if (userStreaming !== null) {
    userStreaming.stop()
    userStreaming = null
  }
})

let localStreaming = null

ipcMain.on('start-local-streaming', (event, ac) => {
  const account = new Account(accountDB)
  account.getAccount(ac._id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-start-local-streaming', err)
    })
    .then((account) => {
      // Stop old local streaming
      if (localStreaming !== null) {
        localStreaming.stop()
        localStreaming = null
      }

      localStreaming = new Streaming(account)
      localStreaming.start(
        '/streaming/public/local',
        (update) => {
          event.sender.send('update-start-local-streaming', update)
        },
        (err) => {
          log.error(err)
          event.sender.send('error-start-local-streaming', err)
        }
      )
    })
})

ipcMain.on('stop-local-streaming', (event, _) => {
  localStreaming.stop()
  localStreaming = null
})

let publicStreaming = null

ipcMain.on('start-public-streaming', (event, ac) => {
  const account = new Account(accountDB)
  account.getAccount(ac._id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-start-public-streaming', err)
    })
    .then((account) => {
      // Stop old public streaming
      if (publicStreaming !== null) {
        publicStreaming.stop()
        publicStreaming = null
      }

      publicStreaming = new Streaming(account)
      publicStreaming.start(
        '/streaming/public',
        (update) => {
          event.sender.send('update-start-public-streaming', update)
        },
        (err) => {
          log.error(err)
          event.sender.send('error-start-public-streaming', err)
        }
      )
    })
})

ipcMain.on('stop-public-streaming', (event, _) => {
  publicStreaming.stop()
  publicStreaming = null
})

let listStreaming = null

ipcMain.on('start-list-streaming', (event, obj) => {
  const account = new Account(accountDB)
  account.getAccount(obj.account._id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-start-list-streaming', err)
    })
    .then((account) => {
      // Stop old list streaming
      if (listStreaming !== null) {
        listStreaming.stop()
        listStreaming = null
      }

      listStreaming = new Streaming(account)
      listStreaming.start(
        `/streaming/list?list=${obj.list_id}`,
        (update) => {
          event.sender.send('update-start-list-streaming', update)
        },
        (err) => {
          log.error(err)
          event.sender.send('error-start-list-streaming', err)
        }
      )
    })
})

// sounds
ipcMain.on('fav-rt-action-sound', (event, _) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load()
    .then((conf) => {
      if (conf.general.sound.fav_rb) {
        const sound = path.join(soundBasePath, 'operation_sound01.wav')
        simplayer(sound, (err) => {
          if (err) log.error(err)
        })
      }
    })
    .catch(err => log.error(err))
})

ipcMain.on('toot-action-sound', (event, _) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load()
    .then((conf) => {
      if (conf.general.sound.toot) {
        const sound = path.join(soundBasePath, 'operation_sound02.wav')
        simplayer(sound, (err) => {
          if (err) log.error(err)
        })
      }
    })
    .catch(err => log.error(err))
})

// preferences
ipcMain.on('get-preferences', (event, _) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load()
    .then((conf) => {
      event.sender.send('response-get-preferences', conf)
    })
    .catch((err) => {
      event.sender.send('error-get-preferences', err)
    })
})

ipcMain.on('save-preferences', (event, data) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.save(data)
    .then((conf) => {
      event.sender.send('response-save-preferences', conf)
    })
    .catch((err) => {
      event.sender.send('error-save-preferences', err)
    })
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

class EmptyTokenError {}
