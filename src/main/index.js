'use strict'

import { app, ipcMain, BrowserWindow, shell } from 'electron'
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

let auth = new Authentication()

// TODO: error handling
ipcMain.on('get-auth-link', (event, _) => {
  auth.getAuthorizationUrl()
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
    .then(token => console.log(token))
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
