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
  nativeTheme,
  IpcMainInvokeEvent,
  Notification,
  NotificationConstructorOptions
} from 'electron'
import fs from 'fs'
import crypto from 'crypto'
import log from 'electron-log'
import windowStateKeeper from 'electron-window-state'
import simplayer from 'simplayer'
import path from 'path'
import ContextMenu from 'electron-context-menu'
import { initSplashScreen, Config } from '@trodi/electron-splashscreen'
import openAboutWindow from 'about-window'
import generator, { detector, OAuth, NotificationType, Entity } from 'megalodon'
import AutoLaunch from 'auto-launch'
import minimist from 'minimist'
import sanitizeHtml from 'sanitize-html'

// db
import { backwardAccount, forwardAccount, getAccount, insertAccount, listAccounts, removeAccount, removeAllAccounts } from './db/account'
import { insertTag, listTags, removeTag } from './db/hashtags'
import { createOrUpdateSetting, getSetting } from './db/setting'
import { insertServer } from './db/server'

import { DirectStreaming, ListStreaming, LocalStreaming, PublicStreaming, StreamingURL, TagStreaming, UserStreaming } from './websocket'
import Preferences from './preferences'
import Fonts from './fonts'
import i18next from '~/src/config/i18n'
import { i18n as I18n } from 'i18next'
import Language, { LanguageType } from '../constants/language'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalTag } from '~/src/types/localTag'
import { Proxy } from '~/src/types/proxy'
import ProxyConfiguration from './proxy'
import { Menu as MenuPreferences } from '~/src/types/preference'
import { General as GeneralPreferences } from '~/src/types/preference'
import newDB from './database'
import { Setting } from '~/src/types/setting'
import { LocalServer } from '~/src/types/localServer'
import { Notify } from '~/src/types/notify'

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

const appId = 'social.whalebird.desktop'

const splashURL =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../../static/splash-screen.html')
    : path.join(__dirname, '/static/splash-screen.html')

const userData = app.getPath('userData')
const appPath = app.getPath('exe')
const dbDir = path.join(userData, '/db')

if (!fs.existsSync(dbDir) || !fs.lstatSync(dbDir).isDirectory()) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const databasePath = path.join(dbDir, 'whalebird.db')
const db = newDB(databasePath)

const preferencesDBPath = path.join(dbDir, 'preferences.json')

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

const getGeneralPreferences = async (): Promise<GeneralPreferences> => {
  const preferences = new Preferences(preferencesDBPath)
  const conf = await preferences.load()
  return conf.general
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
   * List accounts
   */
  const accounts = await listAccounts(db)
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map(([a, s], index) => {
    return {
      label: s.domain,
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
   * Get general preferences
   */
  const generalPreferences = await getGeneralPreferences()

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

    // Minimize to tray immediately if "hide on launch" selected
    // or if --hidden arg is passed
    if ((generalPreferences.other.hideOnLaunch || args.hidden) && !args.show) {
      mainWindow.once('show', () => {
        mainWindow?.hide()
        mainWindow?.setSkipTaskbar(true)
      })
    }
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
 --hidden  start Whalebird hidden to tray
 --show    start Whalebird with a window
`)
  process.exit(0)
}

// Do not lower the rendering priority of Chromium when background
app.commandLine.appendSwitch('disable-renderer-backgrounding')

app.on('ready', async () => {
  createWindow()
  const accounts = await listAccounts(db)
  const preferences = new Preferences(preferencesDBPath)
  startUserStreamings(accounts, proxyConfiguration, preferences)
  startDirectStreamings(accounts, proxyConfiguration)
  startLocalStreamings(accounts, proxyConfiguration)
  startPublicStreamings(accounts, proxyConfiguration)
})

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

ipcMain.handle('add-server', async (_: IpcMainInvokeEvent, domain: string) => {
  const proxy = await proxyConfiguration.forMastodon()
  const sns = await detector(`https://${domain}`, proxy)
  const server = await insertServer(db, `https://${domain}`, domain, sns, null)
  return server
})

ipcMain.handle('add-app', async (_: IpcMainInvokeEvent, url: string) => {
  const proxy = await proxyConfiguration.forMastodon()
  const sns = await detector(url, proxy)
  const client = generator(sns, url, null, 'Whalebird', proxy)
  const appData = await client.registerApp('Whalebird', {
    website: 'https://whalebird.social'
  })
  if (appData.url) {
    shell.openExternal(appData.url)
  }
  return appData
})

type AuthorizeRequest = {
  server: LocalServer
  appData: OAuth.AppData
  code: string
}

ipcMain.handle('authorize', async (_: IpcMainInvokeEvent, req: AuthorizeRequest) => {
  const proxy = await proxyConfiguration.forMastodon()
  const sns = await detector(req.server.baseURL, proxy)
  const client = generator(sns, req.server.baseURL, null, 'Whalebird', proxy)
  const tokenData = await client.fetchAccessToken(req.appData.client_id, req.appData.client_secret, req.code, 'urn:ietf:wg:oauth:2.0:oob')
  let accessToken = tokenData.access_token
  if (sns === 'misskey') {
    // In misskey, access token is sha256(userToken + clientSecret)
    accessToken = crypto
      .createHash('sha256')
      .update(tokenData.access_token + req.appData.client_secret, 'utf8')
      .digest('hex')
  }

  const authorizedClient = generator(sns, req.server.baseURL, accessToken, 'Whalebird', proxy)
  const credentials = await authorizedClient.verifyAccountCredentials()

  const account = await insertAccount(
    db,
    credentials.data.username,
    credentials.data.id,
    credentials.data.avatar,
    req.appData.client_id,
    req.appData.client_secret,
    accessToken,
    tokenData.refresh_token,
    req.server
  )
  return account
})

ipcMain.handle('list-accounts', async (_: IpcMainInvokeEvent) => {
  const accounts = await listAccounts(db)
  return accounts
})

ipcMain.handle('get-local-account', async (_: IpcMainInvokeEvent, id: number) => {
  const account = await getAccount(db, id)
  return account
})

ipcMain.handle('remove-account', async (_: IpcMainInvokeEvent, id: number) => {
  await removeAccount(db, id)

  const accounts = await listAccounts(db)
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map(([account, server], index) => {
    return {
      label: server.domain,
      accelerator: `CmdOrCtrl+${index + 1}`,
      click: () => changeAccount(account, index)
    }
  })

  await updateApplicationMenu(accountsChange)
  await updateDockMenu(accountsChange)
  if (process.platform !== 'darwin' && tray !== null) {
    tray.setContextMenu(TrayMenu(accountsChange, i18next))
  }
})

ipcMain.handle('forward-account', async (_: IpcMainInvokeEvent, id: number) => {
  await forwardAccount(db, id)
})

ipcMain.handle('backward-account', async (_: IpcMainInvokeEvent, id: number) => {
  await backwardAccount(db, id)
})

ipcMain.handle('remove-all-accounts', async (_: IpcMainInvokeEvent) => {
  await removeAllAccounts(db)
  const accounts = await listAccounts(db)
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map(([account, server], index) => {
    return {
      label: server.domain,
      accelerator: `CmdOrCtrl+${index + 1}`,
      click: () => changeAccount(account, index)
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

  const accounts = await listAccounts(db)
  const accountsChange: Array<MenuItemConstructorOptions> = accounts.map(([a, s], index) => {
    return {
      label: s.domain,
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

// hashtag
ipcMain.handle('save-hashtag', async (_: IpcMainInvokeEvent, req: { accountId: number; tag: string }) => {
  await insertTag(db, req.accountId, req.tag)
})

ipcMain.handle('list-hashtags', async (_: IpcMainInvokeEvent, accountId: number) => {
  const tags = await listTags(db, accountId)
  return tags
})

ipcMain.handle('remove-hashtag', async (_: IpcMainInvokeEvent, tag: LocalTag) => {
  await removeTag(db, tag)
})

// Fonts
ipcMain.handle('list-fonts', async (_: IpcMainInvokeEvent) => {
  const list = await Fonts()
  return list
})

// Settings
ipcMain.handle(
  'get-account-setting',
  async (_: IpcMainInvokeEvent, accountId: number): Promise<Setting> => {
    const setting = await getSetting(db, accountId)
    return setting
  }
)

ipcMain.handle(
  'update-account-setting',
  async (_: IpcMainInvokeEvent, setting: Setting): Promise<Setting> => {
    console.log(setting)
    const res = await createOrUpdateSetting(db, setting)
    return res
  }
)

// Cache
ipcMain.handle('get-cache-hashtags', async (_: IpcMainInvokeEvent) => {
  // TODO:
  return []
})

ipcMain.handle('insert-cache-hashtags', async (_: IpcMainInvokeEvent) => {
  return null
})

ipcMain.handle('get-cache-accounts', async (_: IpcMainInvokeEvent) => {
  return []
})

ipcMain.handle('insert-cache-accounts', async (_: IpcMainInvokeEvent) => {
  return []
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
            label: i18n.t<string>('main_menu.application.services'),
            role: 'services'
          },
          {
            type: 'separator'
          },
          {
            label: i18n.t<string>('main_menu.application.hide'),
            role: 'hide'
          },
          {
            label: i18n.t<string>('main_menu.application.hide_others'),
            role: 'hideOthers'
          },
          {
            label: i18n.t<string>('main_menu.application.show_all'),
            role: 'unhide'
          }
        ]

  const macWindowMenu: Array<MenuItemConstructorOptions> =
    process.platform === 'darwin'
      ? []
      : [
          {
            label: i18n.t<string>('main_menu.window.always_show_menu_bar'),
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
            label: i18n.t<string>('main_menu.application.quit'),
            accelerator: 'CmdOrCtrl+Q',
            role: 'quit'
          }
        ]
      : [
          {
            label: i18n.t<string>('main_menu.application.quit'),
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              mainWindow!.destroy()
            }
          }
        ]

  const template: Array<MenuItemConstructorOptions> = [
    {
      label: i18n.t<string>('main_menu.application.name'),
      submenu: [
        {
          label: i18n.t<string>('main_menu.application.about'),
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
          label: i18n.t<string>('main_menu.application.preferences'),
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow!.webContents.send('open-preferences')
          }
        },
        {
          label: i18n.t<string>('main_menu.application.shortcuts'),
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
      label: i18n.t<string>('main_menu.toot.name'),
      submenu: [
        {
          label: i18n.t<string>('main_menu.toot.new'),
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow!.webContents.send('CmdOrCtrl+N')
          }
        }
      ]
    },
    {
      label: i18n.t<string>('main_menu.edit.name'),
      submenu: [
        {
          label: i18n.t<string>('main_menu.edit.undo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: i18n.t<string>('main_menu.edit.redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t<string>('main_menu.edit.cut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: i18n.t<string>('main_menu.edit.copy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: i18n.t<string>('main_menu.edit.paste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: i18n.t<string>('main_menu.edit.select_all'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ] as Array<MenuItemConstructorOptions>
    },
    {
      label: i18n.t<string>('main_menu.view.name'),
      submenu: [
        {
          label: i18n.t<string>('main_menu.view.toggle_full_screen'),
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: i18n.t<string>('main_menu.window.name'),
      submenu: [
        ...macWindowMenu,
        {
          label: i18n.t<string>('main_menu.window.close'),
          role: 'close'
        },
        {
          label: i18n.t<string>('main_menu.window.open'),
          enabled: false,
          click: () => {
            reopenWindow()
          }
        },
        {
          label: i18n.t<string>('main_menu.window.minimize'),
          role: 'minimize'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t<string>('main_menu.window.jump_to'),
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
      label: i18n.t<string>('main_menu.application.open'),
      click: async () => {
        if (mainWindow) {
          mainWindow.show()
        } else {
          await createWindow()
        }
      }
    },
    {
      label: i18n.t<string>('main_menu.application.quit'),
      click: () => {
        stopAllStreamings()
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

const decodeLanguage = (lang: string): LanguageType => {
  const l = Object.keys(Language).find(k => Language[k].key === lang)
  if (l === undefined) {
    return Language.en
  } else {
    return Language[l]
  }
}

//----------------------------------------------
// Streamings
//----------------------------------------------
const userStreamings: { [key: number]: UserStreaming } = {}
const directStreamings: { [key: number]: DirectStreaming } = {}
const localStreamings: { [key: number]: DirectStreaming } = {}
const publicStreamings: { [key: number]: DirectStreaming } = {}

const stopAllStreamings = () => {
  Object.keys(userStreamings).forEach((key: string) => {
    userStreamings[parseInt(key)].stop()
  })
  Object.keys(directStreamings).forEach((key: string) => {
    directStreamings[parseInt(key)].stop()
  })
  Object.keys(localStreamings).forEach((key: string) => [localStreamings[parseInt(key)].stop()])
  Object.keys(publicStreamings).forEach((key: string) => {
    publicStreamings[parseInt(key)].stop()
  })
}

const startUserStreamings = async (
  accounts: Array<[LocalAccount, LocalServer]>,
  proxyConfiguration: ProxyConfiguration,
  preferences: Preferences
) => {
  const proxy = await proxyConfiguration.forMastodon()
  accounts.forEach(async ([account, server]) => {
    const url = await StreamingURL(server.sns, account, server, proxy)
    userStreamings[account.id] = new UserStreaming(server.sns, account, url, proxy)
    userStreamings[account.id].start(
      async (update: Entity.Status) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`update-user-streamings-${account.id}`, update)
        }
      },
      async (notification: Entity.Notification) => {
        await publishNotification(notification, account.id, preferences)
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`notification-user-streamings-${account.id}`, notification)
        }
      },
      (statusId: string) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`delete-user-streamings-${account.id}`, statusId)
        }
      },
      (err: Error) => {
        log.error(err)
      }
    )
  })

  return userStreamings
}

const startDirectStreamings = async (accounts: Array<[LocalAccount, LocalServer]>, proxyConfiguration: ProxyConfiguration) => {
  const proxy = await proxyConfiguration.forMastodon()
  accounts.forEach(async ([account, server]) => {
    const url = await StreamingURL(server.sns, account, server, proxy)
    directStreamings[account.id] = new DirectStreaming(server.sns, account, url, proxy)
    directStreamings[account.id].start(
      (update: Entity.Status) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`update-direct-streamings-${account.id}`, update)
        }
      },
      (id: string) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`delete-direct-streamings-${account.id}`, id)
        }
      },
      (err: Error) => {
        log.error(err)
      }
    )
  })
}

const startLocalStreamings = async (accounts: Array<[LocalAccount, LocalServer]>, proxyConfiguration: ProxyConfiguration) => {
  const proxy = await proxyConfiguration.forMastodon()
  accounts.forEach(async ([account, server]) => {
    const url = await StreamingURL(server.sns, account, server, proxy)
    localStreamings[account.id] = new LocalStreaming(server.sns, account, url, proxy)
    localStreamings[account.id].start(
      (update: Entity.Status) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`update-local-streamings-${account.id}`, update)
        }
      },
      (id: string) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`delete-local-streamings-${account.id}`, id)
        }
      },
      (err: Error) => {
        log.error(err)
      }
    )
  })
}

const startPublicStreamings = async (accounts: Array<[LocalAccount, LocalServer]>, proxyConfiguration: ProxyConfiguration) => {
  const proxy = await proxyConfiguration.forMastodon()
  accounts.forEach(async ([account, server]) => {
    const url = await StreamingURL(server.sns, account, server, proxy)
    publicStreamings[account.id] = new PublicStreaming(server.sns, account, url, proxy)
    publicStreamings[account.id].start(
      (update: Entity.Status) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`update-public-streamings-${account.id}`, update)
        }
      },
      (id: string) => {
        if (!mainWindow?.webContents.isDestroyed()) {
          mainWindow?.webContents.send(`delete-public-streamings-${account.id}`, id)
        }
      },
      (err: Error) => {
        log.error(err)
      }
    )
  })
}

const publishNotification = async (notification: Entity.Notification, accountId: number, preferences: Preferences) => {
  const conf = await preferences.load()
  const options = createNotification(notification, conf.notification.notify)
  if (options !== null) {
    const notify = new Notification(options)
    notify.on('click', _ => {
      if (!mainWindow?.webContents.isDestroyed()) {
        mainWindow?.webContents.send('open-notification-tab', accountId)
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

//----------------------------------------
// List streamings
//----------------------------------------
const listStreamings: { [key: number]: ListStreaming } = {}

type ListStreamingOpts = {
  listId: string
  accountId: number
}

ipcMain.on('start-list-streaming', async (event: IpcMainEvent, obj: ListStreamingOpts) => {
  const { listId, accountId } = obj
  try {
    const [account, server] = await getAccount(db, accountId)

    // Stop old list streaming
    if (listStreamings[accountId] !== undefined) {
      listStreamings[accountId].stop()
    }
    const proxy = await proxyConfiguration.forMastodon()
    const url = await StreamingURL(server.sns, account, server, proxy)
    listStreamings[accountId] = new ListStreaming(server.sns, account, url, proxy)
    listStreamings[accountId].start(
      listId,
      (update: Entity.Status) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send(`update-list-streamings-${accountId}`, update)
        }
      },
      (id: string) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send(`delete-list-streamings-${accountId}`, id)
        }
      },
      (err: Error) => {
        log.error(err)
      }
    )
  } catch (err) {
    log.error(err)
  }
})

//----------------------------------------
// Tag streamings
//----------------------------------------
const tagStreamings: { [key: number]: TagStreaming } = {}

type TagStreamingOpts = {
  tag: string
  accountId: number
}

ipcMain.on('start-tag-streaming', async (event: IpcMainEvent, obj: TagStreamingOpts) => {
  const { tag, accountId } = obj
  try {
    const [account, server] = await getAccount(db, accountId)

    // Stop old tag streaming
    if (tagStreamings[accountId] !== undefined) {
      tagStreamings[accountId].stop()
    }
    const proxy = await proxyConfiguration.forMastodon()
    const url = await StreamingURL(server.sns, account, server, proxy)
    tagStreamings[accountId] = new TagStreaming(server.sns, account, url, proxy)
    tagStreamings[accountId].start(
      tag,
      (update: Entity.Status) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send(`update-tag-streamings-${accountId}`, update)
        }
      },
      (id: string) => {
        if (!event.sender.isDestroyed()) {
          event.sender.send(`delete-tag-streamings-${accountId}`, id)
        }
      },
      (err: Error) => {
        log.error(err)
      }
    )
  } catch (err) {
    log.error(err)
  }
})

ipcMain.handle('open-browser', async (_: IpcMainInvokeEvent, url: string) => {
  shell.openExternal(url)
})
