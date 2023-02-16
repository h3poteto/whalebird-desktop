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
  NotificationConstructorOptions,
  nativeTheme,
  IpcMainInvokeEvent,
  dialog
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
import generator, { Entity, detector, NotificationType, MegalodonInterface } from 'megalodon'
import sanitizeHtml from 'sanitize-html'
import AutoLaunch from 'auto-launch'
import minimist from 'minimist'

import Authentication from './auth'
import Account from './account'
import { StreamingURL, UserStreaming, DirectStreaming, LocalStreaming, PublicStreaming, ListStreaming, TagStreaming } from './websocket'
import Preferences from './preferences'
import Fonts from './fonts'
import Hashtags from './hashtags'
import i18next from '~/src/config/i18n'
import { i18n as I18n } from 'i18next'
import Language, { LanguageType } from '../constants/language'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalTag } from '~/src/types/localTag'
import { Notify } from '~/src/types/notify'
import { StreamingError } from '~/src/errors/streamingError'
import HashtagCache from './cache/hashtag'
import AccountCache from './cache/account'
import { InsertAccountCache } from '~/src/types/insertAccountCache'
import { Proxy } from '~/src/types/proxy'
import ProxyConfiguration from './proxy'
import confirm from './timelines'
import { EnabledTimelines } from '~/src/types/enabledTimelines'
import { Menu as MenuPreferences } from '~/src/types/preference'
import { LocalMarker } from '~/src/types/localMarker'
import Marker from './marker'
import newDB from './database'
import Settings from './settings'
import { BaseSettings, Setting } from '~/src/types/setting'
import packageJson from '../../package.json'
import axios from 'axios'

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
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : path.join('file://', __dirname, '/index.html')

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

const appId = 'org.whalebird.desktop'

const splashURL =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../../static/splash-screen.html')
    : path.join(__dirname, '/static/splash-screen.html')

// https://github.com/louischatriot/nedb/issues/459
const userData = app.getPath('userData')
const appPath = app.getPath('exe')

const accountDBPath = process.env.NODE_ENV === 'production' ? userData + '/db/account.db' : 'account.db'
const accountDB = new Datastore({
  filename: accountDBPath,
  autoload: true
})
const accountRepo = new Account(accountDB)
accountRepo.initialize().catch((err: Error) => log.error(err))

const hashtagsDBPath = process.env.NODE_ENV === 'production' ? userData + '/db/hashtags.db' : 'hashtags.db'
const hashtagsDB = new Datastore({
  filename: hashtagsDBPath,
  autoload: true
})

const settingsDBPath = process.env.NODE_ENV === 'production' ? userData + './db/settings.json' : 'settings.json'

const preferencesDBPath = process.env.NODE_ENV === 'production' ? userData + './db/preferences.json' : 'preferences.json'

const lokiDatabasePath = process.env.NODE_ENV === 'production' ? userData + '/db/lokiDatabase.db' : 'lokiDatabase.db'

let markerRepo: Marker | null = null

/**
 * Cache path
 */
const hashtagCachePath = process.env.NODE_ENV === 'production' ? userData + '/cache/hashtag.db' : 'cache/hashtag.db'
const hashtagCache = new HashtagCache(hashtagCachePath)

const accountCachePath = process.env.NODE_ENV === 'production' ? userData + '/cache/account.db' : 'cache/account.db'
const accountCache = new AccountCache(accountCachePath)

const soundBasePath =
  process.env.NODE_ENV === 'development' ? path.join(__dirname, '../../build/sounds/') : path.join(process.resourcesPath!, 'build/sounds/')
const iconBasePath =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../../build/icons/')
    : path.resolve(process.resourcesPath!, 'build/icons/')

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

async function checkRelease() {
  const version = packageJson.config.buildVersion
  const res = await axios.get('https://whalebird.social/desktop/releases')
  const min_ver = res.data.minimum_support_ver
  const update_url = res.data.download_url
  if (min_ver > version) {
    dialog
      .showMessageBox({
        title: 'Need to update',
        message: `This version is no longer supported.\nPlease update Whalebird.`
      })
      .then(() => {
        shell.openExternal(update_url)
      })
  }
}

checkRelease()

async function listAccounts(): Promise<Array<LocalAccount>> {
  try {
    const accounts = await accountRepo.listAccounts()
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
    log.warn(err)
    return Language.en.key
  }
}

const getSpellChecker = async (): Promise<boolean> => {
  try {
    const preferences = new Preferences(preferencesDBPath)
    const conf = await preferences.load()
    return conf.language.spellchecker.enabled
  } catch (err) {
    return true
  }
}

const getMenuPreferences = async (): Promise<MenuPreferences> => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.load()
  return conf.menu
}

/**
 * Set application menu
 * @return Whether the menu bar is auto hide.
 */
const updateApplicationMenu = async (accountsChange: Array<MenuItemConstructorOptions>): Promise<boolean> => {
  const menuPreferences = await getMenuPreferences()
  const menu = ApplicationMenu(accountsChange, menuPreferences, i18next)
  Menu.setApplicationMenu(menu)
  let autoHideMenuBar = false
  if (menuPreferences.autoHideMenu) {
    autoHideMenuBar = true
  }
  return autoHideMenuBar
}

/**
 * Set dock menu for mac
 */
const updateDockMenu = async (accountsChange: Array<MenuItemConstructorOptions>) => {
  if (process.platform !== 'darwin') {
    return
  }

  const dockMenu = Menu.buildFromTemplate(accountsChange)
  app.dock.setMenu(dockMenu)
}

async function createWindow() {
  /**
     DB
  */
  const lokiDB = await newDB(lokiDatabasePath)
  markerRepo = new Marker(lokiDB)
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
  i18next.changeLanguage(language)

  /**
   * Get spellcheck
   */
  const spellcheck = await getSpellChecker()

  /**
   * Load system theme color for dark mode
   */
  nativeTheme.themeSource = 'system'

  /**
   * Set Application Menu
   */
  const autoHideMenuBar = await updateApplicationMenu(accountsChange)

  /**
   * Set dock menu for mac
   */
  await updateDockMenu(accountsChange)

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
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 563
  })

  const titleBarStyle = process.platform === 'win32' ? 'default' : 'hidden'

  const mainOpts: BrowserWindowConstructorOptions = {
    titleBarStyle: titleBarStyle,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    backgroundColor: '#fff',
    useContentSize: true,
    icon: path.join(iconBasePath, '256x256.png'),
    autoHideMenuBar: autoHideMenuBar,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.resolve(__dirname, './preload.js'),
      spellcheck: spellcheck
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

  /**
   * Get system proxy configuration.
   */
  if (session && session.defaultSession) {
    const proxyInfo = await session.defaultSession.resolveProxy('https://mastodon.social')
    proxyConfiguration.setSystemProxy(proxyInfo)
    log.info(`System proxy configuration: ${proxyInfo}`)
  }

  /**
   * Set proxy for BrowserWindow
   */
  const proxyConfig = await proxyConfiguration.forMastodon()
  if (proxyConfig) {
    await mainWindow.webContents.session.setProxy({ proxyRules: `${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}` })
  }
  mainWindow.loadURL(winURL)

  mainWindow.webContents.on('will-navigate', event => event.preventDefault())

  // Show tray icon only linux and windows.
  if (process.platform !== 'darwin') {
    // Show tray icon
    tray = new Tray(path.join(iconBasePath, 'tray_icon.png'))
    const trayMenu = TrayMenu(accountsChange, i18next)
    tray.setContextMenu(trayMenu)

    // For Windows
    tray.setToolTip(i18next.t('main_menu.application.name'))
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
    mainWindow.on('close', event => {
      mainWindow!.hide()
      mainWindow!.setSkipTaskbar(true)
      event.preventDefault()
    })
  } else {
    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }
}

// Parse command line arguments and show help command.
const args = minimist(process.argv.slice(process.env.NODE_ENV === 'development' ? 2 : 1))
if (args.help) {
  console.log(`
Whalebird is Mastodon, Pleroma and Misskey client for desktop.

Usage
 $ whalebird

Options
 --help    show help
`)
  process.exit(0)
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
    if (menu) {
      if (menu.items[0].submenu) {
        // Preferences
        menu.items[0].submenu.items[2].enabled = false
      }
      if (menu.items[1].submenu) {
        // New Toot
        menu.items[1].submenu.items[0].enabled = false
      }
      if (menu.items[4].submenu) {
        // Open Window
        menu.items[4].submenu.items[1].enabled = true
        // Jump to
        menu.items[4].submenu.items[4].enabled = false
      }
    }
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const auth = new Authentication(accountRepo)

type AuthRequest = {
  instance: string
  sns: 'mastodon' | 'pleroma' | 'misskey'
}

ipcMain.handle('get-auth-url', async (_: IpcMainInvokeEvent, request: AuthRequest) => {
  const proxy = await proxyConfiguration.forMastodon()
  const url = await auth.getAuthorizationUrl(request.sns, request.instance, proxy)
  log.debug(url)
  // Open authorize url in default browser.
  shell.openExternal(url)
  return url
})

type TokenRequest = {
  code: string | null
  sns: 'mastodon' | 'pleroma' | 'misskey'
}

ipcMain.handle('get-and-update-access-token', async (_: IpcMainInvokeEvent, request: TokenRequest) => {
  const proxy = await proxyConfiguration.forMastodon()
  const token = await auth.getAndUpdateAccessToken(request.sns, request.code, proxy)
  // Update instance menu
  const accounts = await listAccounts()
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map((a, index) => {
    return {
      label: a.domain,
      accelerator: `CmdOrCtrl+${index + 1}`,
      click: () => changeAccount(a, index)
    }
  })

  await updateApplicationMenu(accountsChange)
  await updateDockMenu(accountsChange)
  if (process.platform !== 'darwin' && tray !== null) {
    tray.setContextMenu(TrayMenu(accountsChange, i18next))
  }

  return new Promise((resolve, reject) => {
    accountDB.findOne(
      {
        accessToken: token
      },
      (err, doc: any) => {
        if (err) return reject(err)
        if (isEmpty(doc)) return reject(err)
        resolve(doc._id)
      }
    )
  })
})

// nedb
ipcMain.handle('list-accounts', async (_: IpcMainInvokeEvent) => {
  const accounts = await accountRepo.listAccounts()
  return accounts
})

ipcMain.handle('get-local-account', async (_: IpcMainInvokeEvent, id: string) => {
  const account = await accountRepo.getAccount(id)
  return account
})

ipcMain.handle('update-account', async (_: IpcMainInvokeEvent, acct: LocalAccount) => {
  const proxy = await proxyConfiguration.forMastodon()
  const ac: LocalAccount = await accountRepo.refresh(acct, proxy)
  return ac
})

ipcMain.handle('remove-account', async (_: IpcMainInvokeEvent, id: string) => {
  const accountId = await accountRepo.removeAccount(id)

  const accounts = await listAccounts()
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map((a, index) => {
    return {
      label: a.domain,
      accelerator: `CmdOrCtrl+${index + 1}`,
      click: () => changeAccount(a, index)
    }
  })

  await updateApplicationMenu(accountsChange)
  await updateDockMenu(accountsChange)
  if (process.platform !== 'darwin' && tray !== null) {
    tray.setContextMenu(TrayMenu(accountsChange, i18next))
  }

  stopUserStreaming(accountId)
})

ipcMain.handle('forward-account', async (_: IpcMainInvokeEvent, acct: LocalAccount) => {
  await accountRepo.forwardAccount(acct)
})

ipcMain.handle('backward-account', async (_: IpcMainInvokeEvent, acct: LocalAccount) => {
  await accountRepo.backwardAccount(acct)
})

ipcMain.handle('refresh-accounts', async (_: IpcMainInvokeEvent) => {
  const proxy = await proxyConfiguration.forMastodon()
  const accounts = await accountRepo.refreshAccounts(proxy)

  return accounts
})

ipcMain.handle('remove-all-accounts', async (_: IpcMainInvokeEvent) => {
  await accountRepo.removeAll()

  const accounts = await listAccounts()
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map((a, index) => {
    return {
      label: a.domain,
      accelerator: `CmdOrCtrl+${index + 1}`,
      click: () => changeAccount(a, index)
    }
  })

  await updateApplicationMenu(accountsChange)
  await updateDockMenu(accountsChange)
  if (process.platform !== 'darwin' && tray !== null) {
    tray.setContextMenu(TrayMenu(accountsChange, i18next))
  }
})

ipcMain.handle('change-auto-launch', async (_: IpcMainInvokeEvent, enable: boolean) => {
  if (launcher) {
    const enabled = await launcher.isEnabled()
    if (!enabled && enable && launcher) {
      launcher.enable()
    } else if (enabled && !enable && launcher) {
      launcher.disable()
    }
    return enable
  } else {
    return false
  }
})

// badge
ipcMain.on('reset-badge', () => {
  if (process.platform === 'darwin') {
    app.dock.setBadge('')
  }
})

ipcMain.handle(
  'confirm-timelines',
  async (_event: IpcMainInvokeEvent, account: LocalAccount): Promise<EnabledTimelines> => {
    const proxy = await proxyConfiguration.forMastodon()
    const timelines = await confirm(account, proxy)

    return timelines
  }
)

// user streaming
const userStreamings: { [key: string]: UserStreaming | null } = {}

ipcMain.on('start-all-user-streamings', (event: IpcMainEvent, accounts: Array<string>) => {
  accounts.map(async id => {
    const acct = await accountRepo.getAccount(id)
    try {
      // Stop old user streaming
      if (userStreamings[id]) {
        userStreamings[id]!.stop()
        userStreamings[id] = null
      }
      const proxy = await proxyConfiguration.forMastodon()
      const sns = await detector(acct.baseURL, proxy)
      const url = await StreamingURL(sns, acct, proxy)
      userStreamings[id] = new UserStreaming(sns, acct, url, proxy)
      userStreamings[id]!.start(
        async (update: Entity.Status) => {
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
        async (notification: Entity.Notification) => {
          await publishNotification(notification, event, id)

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
      // Generate notifications received while the app was not running
      const client = generator(sns, acct.baseURL, acct.accessToken, 'Whalebird', proxy)
      const marker = await getMarker(client, id)
      if (marker !== null) {
        const unreadResponse = await client.getNotifications({ min_id: marker.last_read_id })
        unreadResponse.data.map(async notification => {
          await publishNotification(notification, event, id)
        })
      }
    } catch (err: any) {
      log.error(err)
      const streamingError = new StreamingError(err.message, acct.domain)
      if (!event.sender.isDestroyed()) {
        event.sender.send('error-start-all-user-streamings', streamingError)
      }
    }
  })
})

ipcMain.on('stop-all-user-streamings', () => {
  Object.keys(userStreamings).forEach((key: string) => {
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
  Object.keys(userStreamings).forEach((key: string) => {
    if (key === id && userStreamings[id]) {
      userStreamings[id]!.stop()
      userStreamings[id] = null
    }
  })
}

let directMessagesStreaming: DirectStreaming | null = null

ipcMain.on('start-directmessages-streaming', async (event: IpcMainEvent, id: string) => {
  try {
    const acct = await accountRepo.getAccount(id)

    // Stop old directmessages streaming
    if (directMessagesStreaming !== null) {
      directMessagesStreaming.stop()
      directMessagesStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const sns = await detector(acct.baseURL, proxy)
    const url = await StreamingURL(sns, acct, proxy)
    directMessagesStreaming = new DirectStreaming(sns, acct, url, proxy)
    directMessagesStreaming.start(
      (update: Entity.Status) => {
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

let localStreaming: LocalStreaming | null = null

ipcMain.on('start-local-streaming', async (event: IpcMainEvent, id: string) => {
  try {
    const acct = await accountRepo.getAccount(id)

    // Stop old local streaming
    if (localStreaming !== null) {
      localStreaming.stop()
      localStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const sns = await detector(acct.baseURL, proxy)
    const url = await StreamingURL(sns, acct, proxy)
    localStreaming = new LocalStreaming(sns, acct, url, proxy)
    localStreaming.start(
      (update: Entity.Status) => {
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

let publicStreaming: PublicStreaming | null = null

ipcMain.on('start-public-streaming', async (event: IpcMainEvent, id: string) => {
  try {
    const acct = await accountRepo.getAccount(id)

    // Stop old public streaming
    if (publicStreaming !== null) {
      publicStreaming.stop()
      publicStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const sns = await detector(acct.baseURL, proxy)
    const url = await StreamingURL(sns, acct, proxy)
    publicStreaming = new PublicStreaming(sns, acct, url, proxy)
    publicStreaming.start(
      (update: Entity.Status) => {
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

let listStreaming: ListStreaming | null = null

type ListStreamingOpts = {
  listID: string
  accountID: string
}

ipcMain.on('start-list-streaming', async (event: IpcMainEvent, obj: ListStreamingOpts) => {
  const { listID, accountID } = obj
  try {
    const acct = await accountRepo.getAccount(accountID)

    // Stop old list streaming
    if (listStreaming !== null) {
      listStreaming.stop()
      listStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const sns = await detector(acct.baseURL, proxy)
    const url = await StreamingURL(sns, acct, proxy)
    listStreaming = new ListStreaming(sns, acct, url, proxy)
    listStreaming.start(
      listID,
      (update: Entity.Status) => {
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

let tagStreaming: TagStreaming | null = null

type TagStreamingOpts = {
  tag: string
  accountID: string
}

ipcMain.on('start-tag-streaming', async (event: IpcMainEvent, obj: TagStreamingOpts) => {
  const { tag, accountID } = obj
  try {
    const acct = await accountRepo.getAccount(accountID)

    // Stop old tag streaming
    if (tagStreaming !== null) {
      tagStreaming.stop()
      tagStreaming = null
    }
    const proxy = await proxyConfiguration.forMastodon()
    const sns = await detector(acct.baseURL, proxy)
    const url = await StreamingURL(sns, acct, proxy)
    tagStreaming = new TagStreaming(sns, acct, url, proxy)
    tagStreaming.start(
      tag,
      (update: Entity.Status) => {
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
ipcMain.handle('get-preferences', async (_: IpcMainInvokeEvent) => {
  const preferences = new Preferences(preferencesDBPath)
  let enabled = false
  if (launcher) {
    enabled = await launcher.isEnabled()
  }
  await preferences
    .update({
      general: {
        other: {
          launch: enabled
        }
      }
    })
    .catch(err => console.error(err))
  const conf = await preferences.load()
  return conf
})

ipcMain.handle('update-preferences', async (_: IpcMainInvokeEvent, data: any) => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.update(data)
  return conf
})

ipcMain.handle('reset-preferences', async (_: IpcMainInvokeEvent) => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.reset()
  return conf
})

ipcMain.handle('system-use-dark-theme', async (_: IpcMainInvokeEvent) => {
  return nativeTheme.shouldUseDarkColors
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

ipcMain.handle('get-collapse', async (_: IpcMainInvokeEvent) => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.load()
  return conf.state.collapse
})

ipcMain.handle('change-global-header', async (_: IpcMainInvokeEvent, value: boolean) => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.update({
    state: {
      hideGlobalHeader: value
    }
  })
  return conf
})

ipcMain.handle('get-global-header', async (_: IpcMainInvokeEvent) => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.load()
  return conf.state.hideGlobalHeader
})

// proxy
ipcMain.handle('update-proxy-config', async (_event: IpcMainInvokeEvent, proxy: Proxy) => {
  const preferences = new Preferences(preferencesDBPath)
  try {
    const conf = await preferences.update({
      proxy: proxy
    })
    const proxyConfig = await proxyConfiguration.forMastodon()
    if (proxyConfig) {
      await mainWindow?.webContents.session.setProxy({ proxyRules: `${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}` })
    } else {
      await mainWindow?.webContents.session.setProxy({})
    }
    return conf
  } catch (err) {
    log.error(err)
  }
  return null
})

// language
ipcMain.handle('change-language', async (_: IpcMainInvokeEvent, value: string) => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.update({
    language: {
      language: value
    }
  })
  i18next.changeLanguage(conf.language.language)

  const accounts = await listAccounts()
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map((a, index) => {
    return {
      label: a.domain,
      accelerator: `CmdOrCtrl+${index + 1}`,
      click: () => changeAccount(a, index)
    }
  })

  await updateApplicationMenu(accountsChange)
  await updateDockMenu(accountsChange)
  if (process.platform !== 'darwin' && tray !== null) {
    tray.setContextMenu(TrayMenu(accountsChange, i18next))
  }
  return conf.language.language
})

ipcMain.handle('toggle-spellchecker', async (_: IpcMainInvokeEvent, value: boolean) => {
  mainWindow?.webContents.session.setSpellCheckerEnabled(value)

  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.update({
    language: {
      spellchecker: {
        enabled: value
      }
    }
  })
  return conf.language.spellchecker.enabled
})

ipcMain.handle('update-spellchecker-languages', async (_: IpcMainInvokeEvent, languages: Array<string>) => {
  const decoded: Array<string> = languages.map(l => {
    const d = decodeLanguage(l)
    return d.rfc4646
  })
  mainWindow?.webContents.session.setSpellCheckerLanguages(decoded)

  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.update({
    language: {
      spellchecker: {
        languages: languages
      }
    }
  })
  return conf.language.spellchecker.languages
})

// marker
ipcMain.handle('get-home-marker', async (_: IpcMainInvokeEvent, ownerID: string) => {
  if (markerRepo === null) {
    return null
  }
  const marker = await markerRepo.get(ownerID, 'home')
  return marker
})

ipcMain.handle('get-notifications-marker', async (_: IpcMainInvokeEvent, ownerID: string) => {
  if (markerRepo === null) {
    return null
  }
  const marker = await markerRepo.get(ownerID, 'notifications')
  return marker
})

ipcMain.handle('get-mentions-marker', async (_: IpcMainInvokeEvent, ownerID: string) => {
  if (markerRepo === null) {
    return null
  }
  const marker = await markerRepo.get(ownerID, 'mentions')
  return marker
})

ipcMain.on(
  'save-marker',
  async (_: IpcMainEvent, marker: LocalMarker): Promise<LocalMarker | null> => {
    if (marker.owner_id === null || marker.owner_id === undefined || marker.owner_id === '') {
      return null
    }
    if (markerRepo === null) {
      return null
    }
    const res = await markerRepo.save(marker)
    return res
  }
)

// hashtag
ipcMain.handle('save-hashtag', async (_: IpcMainInvokeEvent, tag: string) => {
  const hashtags = new Hashtags(hashtagsDB)
  await hashtags.insertTag(tag)
})

ipcMain.handle('list-hashtags', async (_: IpcMainInvokeEvent) => {
  const hashtags = new Hashtags(hashtagsDB)
  const tags = await hashtags.listTags()
  return tags
})

ipcMain.handle('remove-hashtag', async (_: IpcMainInvokeEvent, tag: LocalTag) => {
  const hashtags = new Hashtags(hashtagsDB)
  await hashtags.removeTag(tag)
})

// Fonts
ipcMain.handle('list-fonts', async (_: IpcMainInvokeEvent) => {
  const list = await Fonts()
  return list
})

// Settings
ipcMain.handle(
  'get-account-setting',
  async (_: IpcMainInvokeEvent, accountID: string): Promise<Setting> => {
    const settings = new Settings(settingsDBPath)
    const setting = await settings.get(accountID)
    return setting
  }
)

ipcMain.handle(
  'update-account-setting',
  async (_: IpcMainInvokeEvent, setting: Setting): Promise<BaseSettings> => {
    const settings = new Settings(settingsDBPath)
    const res = await settings.update(setting)
    return res
  }
)

// Cache
ipcMain.handle('get-cache-hashtags', async (_: IpcMainInvokeEvent) => {
  const tags = await hashtagCache.listTags()
  return tags
})

ipcMain.handle('insert-cache-hashtags', async (_: IpcMainInvokeEvent, tags: Array<string>) => {
  await Promise.all(
    tags.map(async name => {
      await hashtagCache.insertHashtag(name).catch(err => console.error(err))
    })
  )
})

ipcMain.handle('get-cache-accounts', async (_: IpcMainInvokeEvent, ownerID: string) => {
  const accounts = await accountCache.listAccounts(ownerID)
  return accounts
})

ipcMain.handle('insert-cache-accounts', async (_: IpcMainInvokeEvent, obj: InsertAccountCache) => {
  const { ownerID, accts } = obj
  Promise.all(
    accts.map(async acct => {
      await accountCache.insertAccount(ownerID, acct).catch(err => console.error(err))
    })
  )
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

/**
 * Generate application menu
 */
const ApplicationMenu = (accountsChange: Array<MenuItemConstructorOptions>, menu: MenuPreferences, i18n: I18n): Menu => {
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

  const macWindowMenu: Array<MenuItemConstructorOptions> =
    process.platform === 'darwin'
      ? []
      : [
          {
            label: i18n.t('main_menu.window.always_show_menu_bar'),
            type: 'checkbox',
            checked: !menu.autoHideMenu,
            click: item => {
              changeMenuAutoHide(!item.checked)
            }
          },
          {
            type: 'separator'
          }
        ]

  const applicationQuitMenu: Array<MenuItemConstructorOptions> =
    process.platform === 'darwin'
      ? [
          {
            label: i18n.t('main_menu.application.quit'),
            accelerator: 'CmdOrCtrl+Q',
            role: 'quit'
          }
        ]
      : [
          {
            label: i18n.t('main_menu.application.quit'),
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              mainWindow!.destroy()
            }
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
              icon_path: path.join(iconBasePath, '256x256.png'),
              copyright: 'Copyright (c) 2021 AkiraFukushima',
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
            mainWindow!.webContents.send('open-preferences')
          }
        },
        {
          label: i18n.t('main_menu.application.shortcuts'),
          accelerator: 'Shift+?',
          click: () => {
            mainWindow!.webContents.send('open-shortcuts-list')
          }
        },
        ...macGeneralMenu,
        {
          type: 'separator'
        },
        ...applicationQuitMenu
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
        ...macWindowMenu,
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

  return Menu.buildFromTemplate(template)
}

const TrayMenu = (accountsChange: Array<MenuItemConstructorOptions>, i18n: I18n): Menu => {
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

const changeMenuAutoHide = async (autoHide: boolean) => {
  if (mainWindow === null) {
    return null
  }
  mainWindow.autoHideMenuBar = autoHide
  mainWindow.setMenuBarVisibility(!autoHide)
  const preferences = new Preferences(preferencesDBPath)
  preferences.update({
    menu: {
      autoHideMenu: autoHide
    }
  })
  return null
}

async function reopenWindow() {
  if (mainWindow === null) {
    await createWindow()
    return null
  } else {
    return null
  }
}

const publishNotification = async (notification: Entity.Notification, event: IpcMainEvent | IpcMainInvokeEvent, id: string) => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.load()
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
  if (process.platform === 'darwin') {
    app.dock.setBadge('•')
  }
}

const createNotification = (notification: Entity.Notification, notifyConfig: Notify): NotificationConstructorOptions | null => {
  switch (notification.type) {
    case NotificationType.Favourite:
      if (notifyConfig.favourite) {
        return {
          title: i18next.t('notification.favourite.title'),
          body: i18next.t('notification.favourite.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case NotificationType.Follow:
      if (notifyConfig.follow) {
        return {
          title: i18next.t('notification.follow.title'),
          body: i18next.t('notification.follow.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case NotificationType.FollowRequest:
      if (notifyConfig.follow_request) {
        return {
          title: i18next.t('notification.follow_request.title'),
          body: i18next.t('notification.follow_request.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case NotificationType.Mention:
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
    case NotificationType.Reblog:
      if (notifyConfig.reblog) {
        if (notification.status && notification.status.quote) {
          return {
            title: i18next.t('notification.quote.title'),
            body: i18next.t('notification.quote.body', { username: username(notification.account) }),
            silent: false
          } as NotificationConstructorOptions
        } else {
          return {
            title: i18next.t('notification.reblog.title'),
            body: i18next.t('notification.reblog.body', { username: username(notification.account) }),
            silent: false
          } as NotificationConstructorOptions
        }
      }
      break
    case NotificationType.EmojiReaction:
      if (notifyConfig.reaction) {
        return {
          title: i18next.t('notification.reaction.title'),
          body: i18next.t('notification.reaction.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case NotificationType.Status:
      if (notifyConfig.status) {
        return {
          title: i18next.t('notification.status.title'),
          body: i18next.t('notification.status.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case NotificationType.PollVote:
      if (notifyConfig.poll_vote) {
        return {
          title: i18next.t('notification.poll_vote.title'),
          body: i18next.t('notification.poll_vote.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    case NotificationType.PollExpired:
      if (notifyConfig.poll_expired) {
        return {
          title: i18next.t('notification.poll_expired.title'),
          body: i18next.t('notification.poll_expired.body', { username: username(notification.account) }),
          silent: false
        } as NotificationConstructorOptions
      }
      break
    default:
      break
  }
  return null
}

const username = (account: Entity.Account): string => {
  if (account.display_name !== '') {
    return account.display_name
  } else {
    return account.username
  }
}

const decodeLanguage = (lang: string): LanguageType => {
  const l = Object.keys(Language).find(k => Language[k].key === lang)
  if (l === undefined) {
    return Language.en
  } else {
    return Language[l]
  }
}

const getMarker = async (client: MegalodonInterface, accountID: string): Promise<LocalMarker | null> => {
  let serverMarker: Entity.Marker | {} = {}
  try {
    const res = await client.getMarkers(['notifications'])
    serverMarker = res.data
  } catch (err) {
    console.warn(err)
  }
  const s = serverMarker as Entity.Marker
  if (s.notifications !== undefined) {
    return {
      timeline: 'notifications',
      last_read_id: s.notifications.last_read_id
    } as LocalMarker
  }
  if (markerRepo === null) {
    return null
  }
  const marker = await markerRepo.get(accountID, 'notifications')
  return marker
}
