'use strict'

import { app, ipcMain, shell, Menu, Tray } from 'electron'
import Datastore from 'nedb'
import empty from 'is-empty'
import log from 'electron-log'
import windowStateKeeper from 'electron-window-state'
import simplayer from 'simplayer'
import path from 'path'
import ContextMenu from 'electron-context-menu'
import * as Splashscreen from '@trodi/electron-splashscreen'
import openAboutWindow from 'about-window'

import Authentication from './auth'
import Account from './account'
import StreamingManager from './streaming_manager'
import Preferences from './preferences'
import Fonts from './fonts'
import Hashtags from './hashtags'
import UnreadNotification from './unread_notification'
import i18n from '../config/i18n'
import Language from '../constants/language'

/**
 * Context menu
 */
ContextMenu()

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
let tray = null
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const splashURL = process.env.NODE_ENV === 'development'
  ? path.resolve(__dirname, '../../static/splash-screen.html')
  : `${__dirname}/static/splash-screen.html`

// https://github.com/louischatriot/nedb/issues/459
const userData = app.getPath('userData')
const accountDBPath = process.env.NODE_ENV === 'production'
  ? userData + '/db/account.db'
  : 'account.db'
let accountDB = new Datastore({
  filename: accountDBPath,
  autoload: true
})
const accountManager = new Account(accountDB)
accountManager.initialize()
  .catch(err => log.error(err))

const hashtagsDBPath = process.env.NODE_ENV === 'production'
  ? userData + '/db/hashtags.db'
  : 'hashtags.db'
let hashtagsDB = new Datastore({
  filename: hashtagsDBPath,
  autoload: true
})

const unreadNotificationDBPath = process.env.NODE_ENV === 'production'
  ? userData + '/db/unread_notification.db'
  : 'unread_notification.db'
const unreadNotification = new UnreadNotification(unreadNotificationDBPath)
unreadNotification.initialize()
  .catch(err => log.error(err))

const preferencesDBPath = process.env.NODE_ENV === 'production'
  ? userData + './db/preferences.json'
  : 'preferences.json'

const soundBasePath = process.env.NODE_ENV === 'development'
  ? path.join(__dirname, '../../build/sounds/')
  : path.join(process.resourcesPath, 'build/sounds/')

async function listAccounts () {
  try {
    const accounts = await accountManager.listAccounts()
    return accounts
  } catch (err) {
    return []
  }
}

async function changeAccount (account, index) {
  // In MacOS, user can hide the window.
  // In this time, mainWindow in not exist, so we have to create window.
  if (mainWindow === null) {
    await createWindow()
    // We have to wait the web contents is loaded.
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('change-account', Object.assign(account, { index: index }))
    })
  } else {
    mainWindow.webContents.send('change-account', Object.assign(account, { index: index }))
  }
}

async function getLanguage () {
  try {
    const preferences = new Preferences(preferencesDBPath)
    const conf = await preferences.load()
    return conf.language.language
  } catch (err) {
    return Language.en.key
  }
}

/**
 * Minimize to tray when click close button
 */
async function setMinimizeToTray () {
  mainWindow.on('close', (event) => {
    mainWindow.hide()
    mainWindow.setSkipTaskbar(true)
    event.preventDefault()
  })
  tray = new Tray(path.join(__dirname, '../../build/icons/256x256.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: i18n.t('main_menu.application.quit'), click: () => { mainWindow.destroy() } }
  ])
  tray.setToolTip(i18n.t('main_menu.application.name'))
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
      mainWindow.setSkipTaskbar(true)
    } else {
      mainWindow.show()
      mainWindow.setSkipTaskbar(false)
    }
  })
}

async function createWindow () {
  /**
   * List accounts
   */
  const accounts = await listAccounts()
  const accountsChange = accounts.map((a, index) => {
    return {
      label: a.domain,
      accelerator: `CmdOrCtrl+${index + 1}`,
      click: () => changeAccount(a, index)
    }
  })

  /**
   * Get language
   */
  const language = await getLanguage()
  i18n.changeLanguage(language)

  /**
   * Set application menu
   */
  ApplicationMenu(accountsChange, i18n)

  /**
   * Set dock menu for mac
   */
  if (process.platform === 'darwin') {
    const dockMenu = Menu.buildFromTemplate(accountsChange)
    app.dock.setMenu(dockMenu)
  }

  /**
   * Initial window options
   */
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    height: 563
  })
  //  mainWindow = new BrowserWindow({
  const mainOpts = {
    titleBarStyle: 'hidden',
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    useContentSize: true,
    icon: path.resolve(__dirname, '../../build/icons/256x256.png')
  }
  const config = {
    windowOpts: mainOpts,
    templateUrl: splashURL,
    splashScreenOpts: {
      width: 425,
      height: 325
    }
  }
  mainWindow = Splashscreen.initSplashScreen(config)

  mainWindowState.manage(mainWindow)

  mainWindow.loadURL(winURL)

  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault())

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Minimize to tray for win32
  if (process.platform === 'win32') {
    setMinimizeToTray()
  }
}

// Do not lower the rendering priority of Chromium when background
app.commandLine.appendSwitch('disable-renderer-backgrounding')

// Enable accessibility
app.setAccessibilitySupportEnabled(true)

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  // this action is called when user click the close button.
  // In macOS, close button does not shutdown application. It is hide application window.
  if (process.platform !== 'darwin') {
    app.quit()
  } else {
    // In MacOS, we should change disable some menu items.
    const menu = Menu.getApplicationMenu()
    // Preferences
    menu.items[0].submenu.items[2].enabled = false
    // New Toot
    menu.items[1].submenu.items[0].enabled = false
    // Open Window
    menu.items[4].submenu.items[1].enabled = true
    // Jump to
    menu.items[4].submenu.items[4].enabled = false
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let auth = new Authentication(accountManager)

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
    .then((token) => {
      accountDB.findOne({
        accessToken: token
      }, (err, doc) => {
        if (err) return event.sender.send('error-get-access-token', err)
        if (empty(doc)) return event.sender.send('error-get-access-token', 'error document is empty')
        event.sender.send('response-get-access-token', doc._id)
      })
    })
    .catch((err) => {
      log.error(err)
      event.sender.send('error-get-access-token', err)
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
  accountManager.listAccounts()
    .catch((err) => {
      log.error(err)
      event.sender.send('error-list-accounts', err)
    })
    .then((accounts) => {
      event.sender.send('response-list-accounts', accounts)
    })
})

ipcMain.on('get-local-account', (event, id) => {
  accountManager.getAccount(id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-get-local-account', err)
    })
    .then((account) => {
      event.sender.send('response-get-local-account', account)
    })
})

ipcMain.on('update-account', (event, acct) => {
  accountManager.refresh(acct)
    .then((ac) => {
      event.sender.send('response-update-account', ac)
    })
    .catch((err) => {
      event.sender.send('error-update-account', err)
    })
})

ipcMain.on('remove-account', (event, id) => {
  accountManager.removeAccount(id)
    .then(() => {
      event.sender.send('response-remove-account')
    })
    .catch((err) => {
      event.sender.send('error-remove-account', err)
    })
})

ipcMain.on('forward-account', (event, acct) => {
  accountManager.forwardAccount(acct)
    .then(() => {
      event.sender.send('response-forward-account')
    })
    .catch((err) => {
      log.error(err)
      event.sender.send('error-forward-account', err)
    })
})

ipcMain.on('backward-account', (event, acct) => {
  accountManager.backwardAccount(acct)
    .then(() => {
      event.sender.send('response-backward-account')
    })
    .catch((err) => {
      event.sender.send('error-backward-account', err)
    })
})

ipcMain.on('refresh-accounts', (event, _) => {
  accountManager.refreshAccounts()
    .then((accounts) => {
      event.sender.send('response-refresh-accounts', accounts)
    })
    .catch((err) => {
      event.sender.send('error-refresh-accounts', err)
    })
})

ipcMain.on('remove-all-accounts', (event, _) => {
  accountManager.removeAll()
    .then(() => {
      event.sender.send('response-remove-all-accounts')
    })
    .catch((err) => {
      log.error(err)
      event.sender.send('error-remove-all-accounts', err)
    })
})

// badge
ipcMain.on('reset-badge', () => {
  if (process.platform === 'darwin') {
    app.dock.setBadge('')
  }
})

// streaming
let userStreaming = null

ipcMain.on('start-user-streaming', (event, ac) => {
  accountManager.getAccount(ac._id)
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

      userStreaming = new StreamingManager(account)
      userStreaming.startUser(
        (update) => {
          event.sender.send('update-start-user-streaming', update)
        },
        (notification) => {
          event.sender.send('notification-start-user-streaming', notification)
          if (process.platform === 'darwin') {
            app.dock.setBadge('•')
          }
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

let directMessagesStreaming = null

ipcMain.on('start-directmessages-streaming', (event, ac) => {
  accountManager.getAccount(ac._id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-start-directmessages-streaming', err)
    })
    .then((account) => {
      // Stop old directmessages streaming
      if (directMessagesStreaming !== null) {
        directMessagesStreaming.stop()
        directMessagesStreaming = null
      }

      directMessagesStreaming = new StreamingManager(account)
      directMessagesStreaming.start(
        'direct',
        null,
        (update) => {
          event.sender.send('update-start-directmessages-streaming', update)
        },
        (err) => {
          log.error(err)
          event.sender.send('error-start-directmessages-streaming', err)
        }
      )
    })
})

ipcMain.on('stop-directmessages-streaming', (event, _) => {
  if (directMessagesStreaming !== null) {
    directMessagesStreaming.stop()
    directMessagesStreaming = null
  }
})

let localStreaming = null

ipcMain.on('start-local-streaming', (event, ac) => {
  accountManager.getAccount(ac._id)
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

      localStreaming = new StreamingManager(account)
      localStreaming.start(
        'public/local',
        null,
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
  if (localStreaming !== null) {
    localStreaming.stop()
    localStreaming = null
  }
})

let publicStreaming = null

ipcMain.on('start-public-streaming', (event, ac) => {
  accountManager.getAccount(ac._id)
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

      publicStreaming = new StreamingManager(account)
      publicStreaming.start(
        'public',
        null,
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
  if (publicStreaming !== null) {
    publicStreaming.stop()
    publicStreaming = null
  }
})

let listStreaming = null

ipcMain.on('start-list-streaming', (event, obj) => {
  accountManager.getAccount(obj.account._id)
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

      listStreaming = new StreamingManager(account)
      listStreaming.start(
        'list',
        `list=${obj.list_id}`,
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

ipcMain.on('stop-list-streaming', (event, _) => {
  if (listStreaming !== null) {
    listStreaming.stop()
    listStreaming = null
  }
})

let tagStreaming = null

ipcMain.on('start-tag-streaming', (event, obj) => {
  accountManager.getAccount(obj.account._id)
    .catch((err) => {
      log.error(err)
      event.sender.send('error-start-tag-streaming', err)
    })
    .then((account) => {
      // Stop old tag streaming
      if (tagStreaming !== null) {
        tagStreaming.stop()
        tagStreaming = null
      }

      tagStreaming = new StreamingManager(account)
      tagStreaming.start(
        'hashtag',
        `tag=${obj.tag}`,
        (update) => {
          event.sender.send('update-start-tag-streaming', update)
        },
        (err) => {
          log.error(err)
          event.sender.send('error-start-tag-streaming', err)
        }
      )
    })
})

ipcMain.on('stop-tag-streaming', (event, _) => {
  if (tagStreaming !== null) {
    tagStreaming.stop()
    tagStreaming = null
  }
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

ipcMain.on('update-preferences', (event, data) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.update(data)
    .then((conf) => {
      event.sender.send('response-update-preferences', conf)
    })
    .catch((err) => {
      event.sender.send('error-update-preferences', err)
    })
})

ipcMain.on('change-collapse', (event, value) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.update(
    {
      state: {
        collapse: value
      }
    })
    .catch((err) => {
      log.error(err)
    })
})

ipcMain.on('get-collapse', (event, _) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load()
    .then((conf) => {
      event.sender.send('response-get-collapse', conf.state.collapse)
    })
})

ipcMain.on('change-global-header', (event, value) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.update(
    {
      state: {
        hideGlobalHeader: value
      }
    })
    .then((conf) => {
      event.sender.send('response-change-global-header', conf)
    })
    .catch(err => {
      log.error(err)
    })
})

ipcMain.on('get-global-header', (event, _) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load()
    .then((conf) => {
      event.sender.send('response-get-global-header', conf.state.hideGlobalHeader)
    })
})

ipcMain.on('change-language', (event, value) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.update(
    {
      language: {
        language: value
      }
    })
    .then((conf) => {
      i18n.changeLanguage(conf.language.language)
      event.sender.send('response-change-language', conf.language.language)
    })
})

// hashtag
ipcMain.on('save-hashtag', (event, tag) => {
  const hashtags = new Hashtags(hashtagsDB)
  hashtags.insertTag(tag)
    .then(() => {
      event.sender.send('response-save-hashtag')
    })
    .catch((err) => {
      log.error(err)
    })
})

ipcMain.on('list-hashtags', (event, _) => {
  const hashtags = new Hashtags(hashtagsDB)
  hashtags.listTags()
    .then((tags) => {
      event.sender.send('response-list-hashtags', tags)
    })
    .catch((err) => {
      event.sender.send('error-list-hashtags', err)
    })
})

ipcMain.on('remove-hashtag', (event, tag) => {
  const hashtags = new Hashtags(hashtagsDB)
  hashtags.removeTag(tag)
    .then(() => {
      event.sender.send('response-remove-hashtag')
    })
    .catch((err) => {
      event.sender.send('error-remove-hashtag', err)
    })
})

// Fonts
ipcMain.on('list-fonts', (event, _) => {
  Fonts()
    .then(list => {
      event.sender.send('response-list-fonts', list)
    })
    .catch(err => {
      event.sender.send('error-list-fonts', err)
    })
})

// Unread notifications
ipcMain.on('get-unread-notification', (event, accountID) => {
  unreadNotification.findOne({
    accountID: accountID
  })
    .then(doc => {
      event.sender.send('response-get-unread-notification', doc)
    })
    .catch(err => {
      event.sender.send('error-get-unread-notification', err)
    })
})

ipcMain.on('update-unread-notification', (event, obj) => {
  const { accountID } = obj
  unreadNotification.insertOrUpdate(accountID, obj)
    .then(_ => {
      event.sender.send('response-update-unread-notification', true)
    })
    .catch(err => {
      console.error(err)
      event.sender.send('error-update-unread-notification', err)
    })
})

// Application control
ipcMain.on('relaunch', (event, _) => {
  app.relaunch()
  app.exit()
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

/**
 * Set application menu
 */
const ApplicationMenu = (accountsChange, i18n) => {
  /**
   * For mac menu
   */
  const macGeneralMenu = process.platform !== 'darwin' ? [] : [
    {
      type: 'separator'
    },
    {
      label: i18n.t('main_menu.application.services'),
      role: 'services',
      submenu: []
    },
    {
      type: 'separator'
    },
    {
      label: i18n.t('main_menu.application.hide'),
      role: 'hide'
    },
    {
      label: i18n.t('main_menu.application.hide_others'),
      role: 'hideothers'
    },
    {
      label: i18n.t('main_menu.application.show_all'),
      role: 'unhide'
    }
  ]

  const template = [
    {
      label: i18n.t('main_menu.application.name'),
      submenu: [
        {
          label: i18n.t('main_menu.application.about'),
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
          label: i18n.t('main_menu.application.preferences'),
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-preferences')
          }
        },
        ...macGeneralMenu,
        {
          type: 'separator'
        },
        {
          label: i18n.t('main_menu.application.quit'),
          accelerator: 'CmdOrCtrl+Q',
          role: 'quit'
        }
      ]
    },
    {
      label: i18n.t('main_menu.toot.name'),
      submenu: [
        {
          label: i18n.t('main_menu.toot.new'),
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('CmdOrCtrl+N')
          }
        }
      ]
    },
    {
      label: i18n.t('main_menu.edit.name'),
      submenu: [
        {
          label: i18n.t('main_menu.edit.undo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: i18n.t('main_menu.edit.redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('main_menu.edit.cut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: i18n.t('main_menu.edit.copy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: i18n.t('main_menu.edit.paste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: i18n.t('main_menu.edit.select_all'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: i18n.t('main_menu.view.name'),
      submenu: [
        {
          label: i18n.t('main_menu.view.toggle_full_screen'),
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: i18n.t('main_menu.window.name'),
      submenu: [
        {
          label: i18n.t('main_menu.window.close'),
          role: 'close'
        },
        {
          label: i18n.t('main_menu.window.open'),
          enabled: false,
          click: () => {
            reopenWindow()
          }
        },
        {
          label: i18n.t('main_menu.window.minimize'),
          role: 'minimize'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('main_menu.window.jump_to'),
          accelerator: 'CmdOrCtrl+K',
          enabled: true,
          click: () => {
            mainWindow.webContents.send('CmdOrCtrl+K')
          }
        },
        {
          type: 'separator'
        },
        ...accountsChange
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

async function reopenWindow () {
  if (mainWindow === null) {
    await createWindow()
    return null
  } else {
    return null
  }
}
