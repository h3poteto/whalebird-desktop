'use strict'

import { app, ipcMain, BrowserWindow, shell, Menu } from 'electron'
import Datastore from 'nedb'
import empty from 'is-empty'

import Authentication from './auth'
import Account from './account'
import Streaming from './streaming'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

let db = new Datastore({
  filename: 'whalebird.db',
  autoload: true
})

function createWindow () {
  /**
   * Set menu
   */
  const template = [
    {
      label: 'Whalebird',
      submenu: [
        {
          label: 'About Whalebird',
          role: 'about'
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
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let auth = new Authentication(db)

ipcMain.on('get-auth-url', (event, domain) => {
  auth.getAuthorizationUrl(domain)
    .catch((err) => {
      console.error(err)
      event.sender.send('error-get-auth-url', err)
    })
    .then((url) => {
      console.log(url)
      event.sender.send('response-get-auth-url', url)
      // Open authorize url in default browser.
      shell.openExternal(url)
    })
})

ipcMain.on('get-access-token', (event, code) => {
  auth.getAccessToken(code)
    .catch((err) => {
      console.error(err)
      event.sender.send('error-get-access-token', err)
    })
    .then((token) => {
      db.findOne({
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
  const account = new Account(db)
  account.listAccounts()
    .catch((err) => {
      console.error(err)
      event.sender.send('error-list-accounts', err)
    })
    .then((accounts) => {
      event.sender.send('response-list-accounts', accounts)
    })
})

ipcMain.on('get-local-account', (event, id) => {
  const account = new Account(db)
  account.getAccount(id)
    .catch((err) => {
      event.sender.send('error-get-local-account', err)
    })
    .then((account) => {
      event.sender.send('response-get-local-account', account)
    })
})

// streaming
let userStreaming = null

ipcMain.on('start-user-streaming', (event, ac) => {
  const account = new Account(db)
  account.getAccount(ac._id)
    .catch((err) => {
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
          event.sender.send('error-start-user-streaming', err)
        }
      )
    })
})

ipcMain.on('stop-user-streaming', (event, _) => {
  userStreaming.stop()
  userStreaming = null
})

let localStreaming = null

ipcMain.on('start-local-streaming', (event, ac) => {
  const account = new Account(db)
  account.getAccount(ac._id)
    .catch((err) => {
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
  const account = new Account(db)
  account.getAccount(ac._id)
    .catch((err) => {
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
          event.sender.send('error-start-public-streaming', err)
        }
      )
    })
})

ipcMain.on('stop-public-streaming', (event, _) => {
  publicStreaming.stop()
  publicStreaming = null
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
