'use strict'

import { app, ipcMain, BrowserWindow, shell } from 'electron'
import Datastore from 'nedb'
import storage from 'electron-json-storage'
import empty from 'is-empty'

import Authentication from './auth'

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

// TODO: error handling
ipcMain.on('get-auth-link', (event, domain) => {
  auth.getAuthorizationUrl(`https://${domain}`)
    .catch(err => console.error(err))
    .then((url) => {
      console.log(url)
      event.sender.send('auth-link-reply', url)
      shell.openExternal(url)
    })
})

// TODO: error handling
ipcMain.on('get-access-token', (event, code) => {
  auth.getAccessToken(code)
    .catch(err => console.error(err))
    .then((token) => {
      db.findOne({
        accessToken: token
      }, (err, doc) => {
        if (err) return event.sender.send('error-access-token', err)
        if (empty(doc)) return event.sender.send('error-access-token', 'error document is empty')
        event.sender.send('access-token-reply', doc._id)
      })
    })
})

ipcMain.on('load-access-token', (event, _) => {
  auth.loadTokenFromLocal()
    .catch((err) => {
      console.errror(err)
      event.sender.send('error-access-token', err)
    })
    .then((token) => {
      event.sender.send('local-access-token', token)
    })
})

ipcMain.on('list-instances', (event, _) => {
  auth.listInstances()
    .catch((err) => {
      console.error(err)
      event.sender.send('empty-instances', err)
    })
    .then((instances) => {
      event.sender.send('instances', instances)
    })
})

// storage access
ipcMain.on('get-instance-token', (event, _) => {
  storage.get('config', (err, data) => {
    if (err || empty(data)) {
      console.log(err)
      event.sender.send('error-instance-token', err)
    } else {
      event.sender.send('instance-token', data.token)
    }
  })
})

// db
ipcMain.on('get-instance', (event, id) => {
  db.findOne(
    {
      _id: id
    },
    (err, doc) => {
      if (err || empty(doc)) return event.sender.send('empty-instance', err)
      const instance = {
        baseURL: doc.baseURL,
        id: doc.id
      }
      event.sender.send('instance', instance)
    }
  )
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
