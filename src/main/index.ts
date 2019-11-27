'use strict'

import {
  app,
  ipcMain,
  shell,
  session,
  Menu,
  Tray,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  MenuItemConstructorOptions,
  IpcMainEvent,
  Notification,
  NotificationConstructorOptions
} from 'electron'
import Datastore from 'nedb'
import { isEmpty } from 'lodash'
import log from 'electron-log'
import windowStateKeeper from 'electron-window-state'
import simplayer from 'simplayer'
import path from 'path'
import ContextMenu from 'electron-context-menu'
import { initSplashScreen, Config } from '@trodi/electron-splashscreen'
import openAboutWindow from 'about-window'
import { Status, Notification as RemoteNotification, Account as RemoteAccount } from 'megalodon'
import sanitizeHtml from 'sanitize-html'
import AutoLaunch from 'auto-launch'

import pkg from '~/package.json'
import Authentication from './auth'
import Account from './account'
import WebSocket, { StreamingURL } from './websocket'
import Preferences from './preferences'
import Fonts from './fonts'
import Hashtags from './hashtags'
import UnreadNotification from './unreadNotification'
import i18n from '~/src/config/i18n'
import Language from '../constants/language'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalTag } from '~/src/types/localTag'
import { UnreadNotification as UnreadNotificationConfig } from '~/src/types/unreadNotification'
import { Notify } from '~/src/types/notify'
import { StreamingError } from '~/src/errors/streamingError'
import HashtagCache from './cache/hashtag'
import AccountCache from './cache/account'
import { InsertAccountCache } from '~/src/types/insertAccountCache'
import { Proxy } from '~/src/types/proxy'
import ProxyConfiguration from './proxy'

/**
 * Context menu
 */
ContextMenu({
  showCopyImageAddress: true,
  showSaveImageAs: true
})

/**
 * Set log level
 */
log.transports.console.level = 'debug'
log.transports.file.level = 'info'

declare namespace global {
  let __static: string
}

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow: BrowserWindow | null
let tray: Tray | null
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

// MAS build is not allowed requestSingleInstanceLock.
// ref: https://github.com/h3poteto/whalebird-desktop/issues/1030
// ref: https://github.com/electron/electron-osx-sign/issues/137#issuecomment-307626305
if (process.platform !== 'darwin') {
  // Enforces single instance for linux and windows.
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        if (!mainWindow!.isVisible()) {
          mainWindow!.show()
          mainWindow!.setSkipTaskbar(false)
        }
        mainWindow.focus()
      }
    })
  }
}

const appId = pkg.build.appId

const splashURL =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../../static/splash-screen.html')
    : `${__dirname}/static/splash-screen.html`

// https://github.com/louischatriot/nedb/issues/459
const userData = app.getPath('userData')
const appPath = app.getPath('exe')

const accountDBPath = process.env.NODE_ENV === 'production' ? userData + '/db/account.db' : 'account.db'
let accountDB = new Datastore({
  filename: accountDBPath,
  autoload: true
})
const accountManager = new Account(accountDB)
accountManager.initialize().catch((err: Error) => log.error(err))

const hashtagsDBPath = process.env.NODE_ENV === 'production' ? userData + '/db/hashtags.db' : 'hashtags.db'
let hashtagsDB = new Datastore({
  filename: hashtagsDBPath,
  autoload: true
})

const unreadNotificationDBPath = process.env.NODE_ENV === 'production' ? userData + '/db/unread_notification.db' : 'unread_notification.db'
const unreadNotification = new UnreadNotification(unreadNotificationDBPath)
unreadNotification.initialize().catch((err: Error) => log.error(err))

const preferencesDBPath = process.env.NODE_ENV === 'production' ? userData + './db/preferences.json' : 'preferences.json'

/**
 * Cache path
 */
const hashtagCachePath = process.env.NODE_ENV === 'production' ? userData + '/cache/hashtag.db' : 'cache/hashtag.db'
const hashtagCache = new HashtagCache(hashtagCachePath)

const accountCachePath = process.env.NODE_ENV === 'production' ? userData + '/cache/account.db' : 'cache/account.db'
const accountCache = new AccountCache(accountCachePath)

const soundBasePath =
  process.env.NODE_ENV === 'development' ? path.join(__dirname, '../../build/sounds/') : path.join(process.resourcesPath!, 'build/sounds/')

let launcher: AutoLaunch | null = null
const proxyConfiguration = new ProxyConfiguration(preferencesDBPath)

// On MAS build, auto launch is not working.
// We have to use Launch Agent: https://github.com/Teamwork/node-auto-launch/issues/43
// But it is too difficult to build, and Slack does not provide this function in MAS build.
// Therefore I don't provide this function for MacOS.
if (process.platform !== 'darwin') {
  launcher = new AutoLaunch({
    name: 'Whalebird',
    path: appPath
  })
}

async function listAccounts(): Promise<Array<LocalAccount>> {
  try {
    const accounts = await accountManager.listAccounts()
    return accounts
  } catch (err) {
    return []
  }
}

async function changeAccount(account: LocalAccount, index: number) {
  // Sometimes application is closed to tray.
  // In this time, mainWindow in not exist, so we have to create window.
  if (mainWindow === null) {
    await createWindow()
    // We have to wait the web contents is loaded.
    mainWindow!.webContents.on('did-finish-load', () => {
      mainWindow!.webContents.send('change-account', Object.assign(account, { index: index }))
    })
  } else {
    mainWindow.show()
    mainWindow.webContents.send('change-account', Object.assign(account, { index: index }))
  }
}

async function getLanguage() {
  try {
    const preferences = new Preferences(preferencesDBPath)
    const conf = await preferences.load()
    return conf.language.language
  } catch (err) {
    return Language.en.key
  }
}

async function createWindow() {
  /**
   * List accounts
   */
  const accounts = await listAccounts()
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map((a, index) => {
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
   * Windows10 don't notify, so we have to set appId
   * https://github.com/electron/electron/issues/10864
   */
  app.setAppUserModelId(appId)

  /**
   * Enable accessibility
   */
  app.accessibilitySupportEnabled = true

  /**
   * Initial window options
   */
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 563
  })
  const mainOpts: BrowserWindowConstructorOptions = {
    titleBarStyle: 'hidden',
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    useContentSize: true,
    icon: path.resolve(__dirname, '../../build/icons/256x256.png'),
    webPreferences: {
      // It is required to use ipcRenderer in renderer process.
      // But it is not secure, so if you want to disable this option, please use preload script.
      nodeIntegration: true
    }
  }
  const config: Config = {
    windowOpts: mainOpts,
    templateUrl: splashURL,
    splashScreenOpts: {
      width: 425,
      height: 325
    }
  }
  mainWindow = initSplashScreen(config)

  mainWindowState.manage(mainWindow)

  mainWindow.loadURL(winURL)

  mainWindow.webContents.on('will-navigate', event => event.preventDefault())

  /**
   * Get system proxy configuration.
   */
  if (session && session.defaultSession) {
    session.defaultSession.resolveProxy('https://mastodon.social', proxyInfo => {
      proxyConfiguration.setSystemProxy(proxyInfo)
      log.info(`System proxy configuration: ${proxyInfo}`)
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Show tray icon only linux and windows.
  if (process.platform !== 'darwin') {
    // Show tray icon
    tray = new Tray(path.join(__dirname, '../../build/icons/tray_icon.png'))
    const trayMenu = TrayMenu(accountsChange, i18n)
    tray.setContextMenu(trayMenu)

    // For Windows
    tray.setToolTip(i18n.t('main_menu.application.name'))
    tray.on('click', () => {
      if (mainWindow!.isVisible()) {
        mainWindow!.hide()
        mainWindow!.setSkipTaskbar(true)
      } else {
        mainWindow!.show()
        mainWindow!.setSkipTaskbar(false)
      }
    })

    // Minimize to tray
    mainWindow!.on('close', event => {
      mainWindow!.hide()
      mainWindow!.setSkipTaskbar(true)
      event.preventDefault()
    })
  }
}

// Do not lower the rendering priority of Chromium when background
app.commandLine.appendSwitch('disable-renderer-backgrounding')

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  // this action is called when user click the close button.
  // In macOS, close button does not shutdown application. It is hide application window.
  if (process.platform !== 'darwin') {
    app.quit()
  } else {
    // In MacOS, we should change disable some menu items.
    const menu = Menu.getApplicationMenu()
    if (menu !== null) {
      // Preferences
      menu.items[0].submenu.items[2].enabled = false as boolean
      // New Toot
      menu.items[1].submenu.items[0].enabled = false as boolean
      // Open Window
      menu.items[4].submenu.items[1].enabled = true as boolean
      // Jump to
      menu.items[4].submenu.items[4].enabled = false as boolean
    }
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let auth = new Authentication(accountManager)

ipcMain.on('get-auth-url', async (event: IpcMainEvent, domain: string) => {
  const proxy = await proxyConfiguration.forMastodon()
  auth
    .getAuthorizationUrl(domain, proxy)
    .then(url => {
      log.debug(url)
      event.sender.send('response-get-auth-url', url)
      // Open authorize url in default browser.
      shell.openExternal(url)
    })
    .catch(err => {
      log.error(err)
      event.sender.send('error-get-auth-url', err)
    })
})

ipcMain.on('get-access-token', async (event: IpcMainEvent, code: string) => {
  const proxy = await proxyConfiguration.forMastodon()
  auth
    .getAccessToken(code, proxy)
    .then(token => {
      accountDB.findOne(
        {
          accessToken: token
        },
        (err, doc: any) => {
          if (err) return event.sender.send('error-get-access-token', err)
          if (isEmpty(doc)) return event.sender.send('error-get-access-token', 'error document is empty')
          event.sender.send('response-get-access-token', doc._id)
        }
      )
    })
    .catch(err => {
      log.error(err)
      event.sender.send('error-get-access-token', err)
    })
})

// environments
ipcMain.on('get-social-token', (event: IpcMainEvent) => {
  const token = process.env.SOCIAL_TOKEN
  if (isEmpty(token)) {
    return event.sender.send('error-get-social-token', new EmptyTokenError())
  }
  event.sender.send('response-get-social-token', token)
})

// nedb
ipcMain.on('list-accounts', (event: IpcMainEvent) => {
  accountManager
    .listAccounts()
    .catch(err => {
      log.error(err)
      event.sender.send('error-list-accounts', err)
    })
    .then(accounts => {
      event.sender.send('response-list-accounts', accounts)
    })
})

ipcMain.on('get-local-account', (event: IpcMainEvent, id: string) => {
  accountManager
    .getAccount(id)
    .catch(err => {
      log.error(err)
      event.sender.send('error-get-local-account', err)
    })
    .then(account => {
      event.sender.send('response-get-local-account', account)
    })
})

ipcMain.on('update-account', async (event: IpcMainEvent, acct: LocalAccount) => {
  const proxy = await proxyConfiguration.forMastodon()
  accountManager
    .refresh(acct, proxy)
    .then(ac => {
      event.sender.send('response-update-account', ac)
    })
    .catch(err => {
      event.sender.send('error-update-account', err)
    })
})

ipcMain.on('remove-account', (event: IpcMainEvent, id: string) => {
  accountManager
    .removeAccount(id)
    .then(id => {
      stopUserStreaming(id)
      event.sender.send('response-remove-account', id)
    })
    .catch(err => {
      event.sender.send('error-remove-account', err)
    })
})

ipcMain.on('forward-account', (event: IpcMainEvent, acct: LocalAccount) => {
  accountManager
    .forwardAccount(acct)
    .then(() => {
      event.sender.send('response-forward-account')
    })
    .catch(err => {
      log.error(err)
      event.sender.send('error-forward-account', err)
    })
})

ipcMain.on('backward-account', (event: IpcMainEvent, acct: LocalAccount) => {
  accountManager
    .backwardAccount(acct)
    .then(() => {
      event.sender.send('response-backward-account')
    })
    .catch(err => {
      event.sender.send('error-backward-account', err)
    })
})

ipcMain.on('refresh-accounts', async (event: IpcMainEvent) => {
  const proxy = await proxyConfiguration.forMastodon()
  accountManager
    .refreshAccounts(proxy)
    .then(accounts => {
      event.sender.send('response-refresh-accounts', accounts)
    })
    .catch(err => {
      event.sender.send('error-refresh-accounts', err)
    })
})

ipcMain.on('remove-all-accounts', (event: IpcMainEvent) => {
  accountManager
    .removeAll()
    .then(() => {
      event.sender.send('response-remove-all-accounts')
    })
    .catch(err => {
      log.error(err)
      event.sender.send('error-remove-all-accounts', err)
    })
})

ipcMain.on('change-auto-launch', (event: IpcMainEvent, enable: boolean) => {
  if (launcher) {
    launcher.isEnabled().then(enabled => {
      if (!enabled && enable && launcher) {
        launcher.enable()
      } else if (enabled && !enable && launcher) {
        launcher.disable()
      }
      event.sender.send('response-change-auto-launch', enable)
    })
  } else {
    event.sender.send('response-change-auto-launch', false)
  }
})

// badge
ipcMain.on('reset-badge', () => {
  if (process.platform === 'darwin') {
    app.dock.setBadge('')
  }
})

// user streaming
let userStreamings: { [key: string]: WebSocket | null } = {}

ipcMain.on('start-all-user-streamings', (event: IpcMainEvent, accounts: Array<LocalAccount>) => {
  accounts.map(async account => {
    const id: string = account._id!
    try {
      const acct = await accountManager.getAccount(id)
      // Stop old user streaming
      if (userStreamings[id]) {
        userStreamings[id]!.stop()
        userStreamings[id] = null
      }
      const proxy = await proxyConfiguration.forMastodon()
      const url = await StreamingURL(acct, proxy)
      userStreamings[id] = new WebSocket(acct, url, proxy)
      userStreamings[id]!.startUserStreaming(
        async (update: Status) => {
          if (!event.sender.isDestroyed()) {
            event.sender.send(`update-start-all-user-streamings-${id}`, update)
          }
          // Cache hashtag
          update.tags.map(async tag => {
            await hashtagCache.insertHashtag(tag.name).catch(err => console.error(err))
          })
          // Cache account
          await accountCache.insertAccount(id, update.account.acct).catch(err => console.error(err))
        },
        (notification: RemoteNotification) => {
          const preferences = new Preferences(preferencesDBPath)
          preferences.load().then(conf => {
            const options = createNotification(notification, conf.notification.notify)
            if (options !== null) {
              const notify = new Notification(options)
              notify.on('click', _ => {
                if (!event.sender.isDestroyed()) {
                  event.sender.send('open-notification-tab', id)
                }
              })
              notify.show()
            }
          })
          if (process.platform === 'darwin') {
            app.dock.setBadge('•')
          }

          // In macOS and Windows, sometimes window is closed (not quit).
          // But streamings are always running.
          // When window is closed, we can not send event to webContents; because it is already destroyed.
          // So we have to guard it.
          if (!event.sender.isDestroyed()) {
            // To update notification timeline
            event.sender.send(`notification-start-all-user-streamings-${id}`, notification)

            // Does not exist a endpoint for only mention. And mention is a part of notification.
            // So we have to get mention from notification.
            if (notification.type === 'mention') {
              event.sender.send(`mention-start-all-user-streamings-${id}`, notification)
            }
          }
        },
        (statusId: string) => {
          if (!event.sender.isDestroyed()) {
            event.sender.send(`delete-start-all-user-streamings-${id}`, statusId)
          }
        },
        (err: Error) => {
          log.error(err)
          // In macOS, sometimes window is closed (not quit).
          // When window is closed, we can not send event to webContents; because it is destroyed.
          // So we have to guard it.
          if (!event.sender.isDestroyed()) {
            event.sender.send('error-start-all-user-streamings', err)
          }
        }
      )
    } catch (err) {
      log.error(err)
      const streamingError = new StreamingError(err.message, account.domain)
      if (!event.sender.isDestroyed()) {
        event.sender.send('error-start-all-user-streamings', streamingError)
      }
    }
  })
})

ipcMain.on('stop-all-user-streamings', () => {
  Object.keys(userStreamings).map((key: string) => {
    if (userStreamings[key]) {
      userStreamings[key]!.stop()
      userStreamings[key] = null
    }
  })
})

/**
 * Stop an user streaming in all user streamings.
 * @param id specified user id in nedb.
 */
const stopUserStreaming = (id: string) => {
  Object.keys(userStreamings).map((key: string) => {
    if (key === id && userStreamings[id]) {
      userStreamings[id]!.stop()
      userStreamings[id] = null
    }
  })
}

type StreamingSetting = {
  account: LocalAccount
}

let directMessagesStreaming: WebSocket | null = null

ipcMain.on('start-directmessages-streaming', async (event: IpcMainEvent, obj: StreamingSetting) => {
  const { account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old directmessages streaming
    if (directMessagesStreaming !== null) {
      directMessagesStreaming.stop()
      directMessagesStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const url = await StreamingURL(acct, proxy)
    directMessagesStreaming = new WebSocket(acct, url, proxy)
    directMessagesStreaming.start(
      'direct',
      (update: Status) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('update-start-directmessages-streaming', update)
        }
      },
      (id: string) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('delete-start-directmessages-streaming', id)
        }
      },
      (err: Error) => {
        log.error(err)
        if (!event.sender.isDestroyed()) {
          event.sender.send('error-start-directmessages-streaming', err)
        }
      }
    )
  } catch (err) {
    log.error(err)
    if (!event.sender.isDestroyed()) {
      event.sender.send('error-start-directmessages-streaming', err)
    }
  }
})

ipcMain.on('stop-directmessages-streaming', () => {
  if (directMessagesStreaming !== null) {
    directMessagesStreaming.stop()
    directMessagesStreaming = null
  }
})

let localStreaming: WebSocket | null = null

ipcMain.on('start-local-streaming', async (event: IpcMainEvent, obj: StreamingSetting) => {
  const { account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old local streaming
    if (localStreaming !== null) {
      localStreaming.stop()
      localStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const url = await StreamingURL(acct, proxy)
    localStreaming = new WebSocket(acct, url, proxy)
    localStreaming.start(
      'public:local',
      (update: Status) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('update-start-local-streaming', update)
        }
      },
      (id: string) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('delete-start-local-streaming', id)
        }
      },
      (err: Error) => {
        log.error(err)
        if (!event.sender.isDestroyed()) {
          event.sender.send('error-start-local-streaming', err)
        }
      }
    )
  } catch (err) {
    log.error(err)
    if (!event.sender.isDestroyed()) {
      event.sender.send('error-start-local-streaming', err)
    }
  }
})

ipcMain.on('stop-local-streaming', () => {
  if (localStreaming !== null) {
    localStreaming.stop()
    localStreaming = null
  }
})

let publicStreaming: WebSocket | null = null

ipcMain.on('start-public-streaming', async (event: IpcMainEvent, obj: StreamingSetting) => {
  const { account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old public streaming
    if (publicStreaming !== null) {
      publicStreaming.stop()
      publicStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const url = await StreamingURL(acct, proxy)
    publicStreaming = new WebSocket(acct, url, proxy)
    publicStreaming.start(
      'public',
      (update: Status) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('update-start-public-streaming', update)
        }
      },
      (id: string) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('delete-start-public-streaming', id)
        }
      },
      (err: Error) => {
        log.error(err)
        if (!event.sender.isDestroyed()) {
          event.sender.send('error-start-public-streaming', err)
        }
      }
    )
  } catch (err) {
    log.error(err)
    if (!event.sender.isDestroyed()) {
      event.sender.send('error-start-public-streaming', err)
    }
  }
})

ipcMain.on('stop-public-streaming', () => {
  if (publicStreaming !== null) {
    publicStreaming.stop()
    publicStreaming = null
  }
})

let listStreaming: WebSocket | null = null

type ListID = {
  listID: string
}

ipcMain.on('start-list-streaming', async (event: IpcMainEvent, obj: ListID & StreamingSetting) => {
  const { listID, account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old list streaming
    if (listStreaming !== null) {
      listStreaming.stop()
      listStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const url = await StreamingURL(acct, proxy)
    listStreaming = new WebSocket(acct, url, proxy)
    listStreaming.start(
      `list&list=${listID}`,
      (update: Status) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('update-start-list-streaming', update)
        }
      },
      (id: string) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('delete-start-list-streaming', id)
        }
      },
      (err: Error) => {
        log.error(err)
        if (!event.sender.isDestroyed()) {
          event.sender.send('error-start-list-streaming', err)
        }
      }
    )
  } catch (err) {
    log.error(err)
    if (!event.sender.isDestroyed()) {
      event.sender.send('error-start-list-streaming', err)
    }
  }
})

ipcMain.on('stop-list-streaming', () => {
  if (listStreaming !== null) {
    listStreaming.stop()
    listStreaming = null
  }
})

let tagStreaming: WebSocket | null = null

type Tag = {
  tag: string
}

ipcMain.on('start-tag-streaming', async (event: IpcMainEvent, obj: Tag & StreamingSetting) => {
  const { tag, account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old tag streaming
    if (tagStreaming !== null) {
      tagStreaming.stop()
      tagStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const url = await StreamingURL(acct, proxy)
    tagStreaming = new WebSocket(acct, url, proxy)
    tagStreaming.start(
      `hashtag&tag=${tag}`,
      (update: Status) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('update-start-tag-streaming', update)
        }
      },
      (id: string) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send('delete-start-tag-streaming', id)
        }
      },
      (err: Error) => {
        log.error(err)
        if (!event.sender.isDestroyed()) {
          event.sender.send('error-start-tag-streaming', err)
        }
      }
    )
  } catch (err) {
    log.error(err)
    if (!event.sender.isDestroyed()) {
      event.sender.send('error-start-tag-streaming', err)
    }
  }
})

ipcMain.on('stop-tag-streaming', () => {
  if (tagStreaming !== null) {
    tagStreaming.stop()
    tagStreaming = null
  }
})

// sounds
ipcMain.on('fav-rt-action-sound', () => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .load()
    .then(conf => {
      if (conf.general.sound.fav_rb) {
        const sound = path.join(soundBasePath, 'operation_sound01.wav')
        simplayer(sound, (err: Error) => {
          if (err) log.error(err)
        })
      }
    })
    .catch(err => log.error(err))
})

ipcMain.on('toot-action-sound', () => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .load()
    .then(conf => {
      if (conf.general.sound.toot) {
        const sound = path.join(soundBasePath, 'operation_sound02.wav')
        simplayer(sound, (err: Error) => {
          if (err) log.error(err)
        })
      }
    })
    .catch(err => log.error(err))
})

// preferences
ipcMain.on('get-preferences', async (event: IpcMainEvent) => {
  const preferences = new Preferences(preferencesDBPath)
  let enabled = false
  if (launcher) {
    enabled = await launcher.isEnabled()
  }
  await preferences
    .update({
      general: {
        other: enabled
      }
    })
    .catch(err => console.error(err))
  const conf = await preferences.load().catch(err => {
    event.sender.send('error-get-preferences', err)
  })
  event.sender.send('response-get-preferences', conf)
})

ipcMain.on('update-preferences', (event: IpcMainEvent, data: any) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .update(data)
    .then(conf => {
      event.sender.send('response-update-preferences', conf)
    })
    .catch(err => {
      event.sender.send('error-update-preferences', err)
    })
})

ipcMain.on('change-collapse', (_event: IpcMainEvent, value: boolean) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .update({
      state: {
        collapse: value
      }
    })
    .catch(err => {
      log.error(err)
    })
})

ipcMain.on('get-collapse', (event: IpcMainEvent) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load().then(conf => {
    event.sender.send('response-get-collapse', conf.state.collapse)
  })
})

ipcMain.on('change-global-header', (event: IpcMainEvent, value: boolean) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .update({
      state: {
        hideGlobalHeader: value
      }
    })
    .then(conf => {
      event.sender.send('response-change-global-header', conf)
    })
    .catch(err => {
      log.error(err)
    })
})

ipcMain.on('get-global-header', (event: IpcMainEvent) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load().then(conf => {
    event.sender.send('response-get-global-header', conf.state.hideGlobalHeader)
  })
})

// proxy
ipcMain.on('update-proxy-config', (event: IpcMainEvent, proxy: Proxy) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .update({
      proxy: proxy
    })
    .then(conf => {
      event.sender.send('response-update-proxy-config', conf)
    })
    .catch(err => {
      log.error(err)
    })
})

ipcMain.on('get-proxy-configuration', async (event: IpcMainEvent) => {
  const proxy = await proxyConfiguration.forMastodon()
  event.sender.send('response-get-proxy-configuration', proxy)
})

// language
ipcMain.on('change-language', (event: IpcMainEvent, value: string) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .update({
      language: {
        language: value
      }
    })
    .then(conf => {
      i18n.changeLanguage(conf.language.language)
      event.sender.send('response-change-language', conf.language.language)
    })
})

// hashtag
ipcMain.on('save-hashtag', (event: IpcMainEvent, tag: string) => {
  const hashtags = new Hashtags(hashtagsDB)
  hashtags
    .insertTag(tag)
    .then(() => {
      event.sender.send('response-save-hashtag')
    })
    .catch(err => {
      log.error(err)
    })
})

ipcMain.on('list-hashtags', (event: IpcMainEvent) => {
  const hashtags = new Hashtags(hashtagsDB)
  hashtags
    .listTags()
    .then(tags => {
      event.sender.send('response-list-hashtags', tags)
    })
    .catch(err => {
      event.sender.send('error-list-hashtags', err)
    })
})

ipcMain.on('remove-hashtag', (event: IpcMainEvent, tag: LocalTag) => {
  const hashtags = new Hashtags(hashtagsDB)
  hashtags
    .removeTag(tag)
    .then(() => {
      event.sender.send('response-remove-hashtag')
    })
    .catch(err => {
      event.sender.send('error-remove-hashtag', err)
    })
})

// Fonts
ipcMain.on('list-fonts', (event: IpcMainEvent) => {
  Fonts()
    .then(list => {
      event.sender.send('response-list-fonts', list)
    })
    .catch(err => {
      event.sender.send('error-list-fonts', err)
    })
})

// Unread notifications
ipcMain.on('get-unread-notification', (event: IpcMainEvent, accountID: string) => {
  unreadNotification
    .findOne({
      accountID: accountID
    })
    .then(doc => {
      event.sender.send('response-get-unread-notification', doc)
    })
    .catch(err => {
      console.warn(err)
      event.sender.send('error-get-unread-notification', err)
    })
})

ipcMain.on('update-unread-notification', (event: IpcMainEvent, config: UnreadNotificationConfig) => {
  const { accountID } = config
  unreadNotification
    .insertOrUpdate(accountID!, config)
    .then(_ => {
      event.sender.send('response-update-unread-notification', true)
    })
    .catch(err => {
      console.error(err)
      event.sender.send('error-update-unread-notification', err)
    })
})

// Cache
ipcMain.on('get-cache-hashtags', async (event: IpcMainEvent) => {
  const tags = await hashtagCache.listTags()
  event.sender.send('response-get-cache-hashtags', tags)
})

ipcMain.on('insert-cache-hashtags', (event: IpcMainEvent, tags: Array<string>) => {
  tags.map(async name => {
    await hashtagCache.insertHashtag(name).catch(err => console.error(err))
  })
  event.sender.send('response-insert-cache-hashtags')
})

ipcMain.on('get-cache-accounts', async (event: IpcMainEvent, ownerID: string) => {
  const accounts = await accountCache.listAccounts(ownerID)
  event.sender.send('response-get-cache-accounts', accounts)
})

ipcMain.on('insert-cache-accounts', (event: IpcMainEvent, obj: InsertAccountCache) => {
  const { ownerID, accts } = obj
  accts.map(async acct => {
    await accountCache.insertAccount(ownerID, acct).catch(err => console.error(err))
  })
  event.sender.send('response-insert-cache-accounts')
})

// Application control
ipcMain.on('relaunch', () => {
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
const ApplicationMenu = (accountsChange: Array<MenuItemConstructorOptions>, i18n: i18n.i18n) => {
  /**
   * For mac menu
   */
  const macGeneralMenu: Array<MenuItemConstructorOptions> =
    process.platform !== 'darwin'
      ? []
      : [
          {
            type: 'separator'
          },
          {
            label: i18n.t('main_menu.application.services'),
            role: 'services'
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
            role: 'hideOthers'
          },
          {
            label: i18n.t('main_menu.application.show_all'),
            role: 'unhide'
          }
        ]

  const template: Array<MenuItemConstructorOptions> = [
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
              open_devtools: process.env.NODE_ENV !== 'production',
              win_options: {
                webPreferences: {
                  nodeIntegration: true
                }
              }
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
            mainWindow!.webContents.send('open-preferences')
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
            mainWindow!.webContents.send('CmdOrCtrl+N')
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
      ] as Array<MenuItemConstructorOptions>
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
            mainWindow!.webContents.send('CmdOrCtrl+K')
          }
        },
        {
          type: 'separator'
        },
        ...accountsChange
      ]
    }
  ]

  const menu: Menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const TrayMenu = (accountsChange: Array<MenuItemConstructorOptions>, i18n: i18n.i18n): Menu => {
  const template: Array<MenuItemConstructorOptions> = [
    ...accountsChange,
    {
      label: i18n.t('main_menu.application.open'),
      click: async () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          await createWindow()
        }
      }
    },
    {
      label: i18n.t('main_menu.application.quit'),
      click: () => {
        mainWindow!.destroy()
      }
    }
  ]
  const menu: Menu = Menu.buildFromTemplate(template)
  return menu
}

async function reopenWindow() {
  if (mainWindow === null) {
    await createWindow()
    return null
  } else {
    return null
  }
}

const createNotification = (notification: RemoteNotification, notifyConfig: Notify): NotificationConstructorOptions | null => {
  switch (notification.type) {
    case 'favourite':
      if (notifyConfig.favourite) {
        return {
          title: i18n.t('notification.favourite.title'),
          body: i18n.t('notification.favourite.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case 'follow':
      if (notifyConfig.follow) {
        return {
          title: i18n.t('notification.follow.title'),
          body: i18n.t('notification.follow.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case 'mention':
      if (notifyConfig.reply) {
        return {
          title: `${username(notification.status!.account)}`,
          body: sanitizeHtml(notification.status!.content, {
            allowedTags: [],
            allowedAttributes: []
          }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case 'reblog':
      if (notifyConfig.reblog) {
        return {
          title: i18n.t('notification.reblog.title'),
          body: i18n.t('notification.reblog.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    default:
      break
  }
  return null
}

const username = (account: RemoteAccount): string => {
  if (account.display_name !== '') {
    return account.display_name
  } else {
    return account.username
  }
}
