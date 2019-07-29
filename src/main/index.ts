'use strict'

import {
  app,
  ipcMain,
  shell,
  Menu,
  Tray,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  MenuItemConstructorOptions,
  Event,
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

const appId = pkg.build.appId

const splashURL =
  process.env.NODE_ENV === 'development'
    ? path.resolve(__dirname, '../../static/splash-screen.html')
    : `${__dirname}/static/splash-screen.html`

// https://github.com/louischatriot/nedb/issues/459
const userData = app.getPath('userData')
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

const soundBasePath =
  process.env.NODE_ENV === 'development' ? path.join(__dirname, '../../build/sounds/') : path.join(process.resourcesPath!, 'build/sounds/')

async function listAccounts(): Promise<Array<LocalAccount>> {
  try {
    const accounts = await accountManager.listAccounts()
    return accounts
  } catch (err) {
    return []
  }
}

async function changeAccount(account: LocalAccount, index: number) {
  // In MacOS, user can hide the window.
  // In this time, mainWindow in not exist, so we have to create window.
  if (mainWindow === null) {
    await createWindow()
    // We have to wait the web contents is loaded.
    mainWindow!.webContents.on('did-finish-load', () => {
      mainWindow!.webContents.send('change-account', Object.assign(account, { index: index }))
    })
  } else {
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

/**
 * Minimize to tray when click close button
 */
async function setMinimizeToTray() {
  mainWindow!.on('close', event => {
    mainWindow!.hide()
    mainWindow!.setSkipTaskbar(true)
    event.preventDefault()
  })
  tray = new Tray(path.join(__dirname, '../../build/icons/256x256.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: i18n.t('main_menu.application.quit'),
      click: () => {
        mainWindow!.destroy()
      }
    }
  ])
  tray.setToolTip(i18n.t('main_menu.application.name'))
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow!.isVisible()) {
      mainWindow!.hide()
      mainWindow!.setSkipTaskbar(true)
    } else {
      mainWindow!.show()
      mainWindow!.setSkipTaskbar(false)
    }
  })
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
   * Windows10 don' notify, so we have to set appId
   * https://github.com/electron/electron/issues/10864
   */
  app.setAppUserModelId(appId)

  /**
   * Enable accessibility
   */
  app.setAccessibilitySupportEnabled(true)

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
      ;((menu.items[0] as MenuItemConstructorOptions).submenu as Menu).items[2].enabled = false as boolean
      // New Toot
      ;((menu.items[1] as MenuItemConstructorOptions).submenu as Menu).items[0].enabled = false as boolean
      // Open Window
      ;((menu.items[4] as MenuItemConstructorOptions).submenu as Menu).items[1].enabled = true as boolean
      // Jump to
      ;((menu.items[4] as MenuItemConstructorOptions).submenu as Menu).items[4].enabled = false as boolean
    }
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let auth = new Authentication(accountManager)

ipcMain.on('get-auth-url', (event: Event, domain: string) => {
  auth
    .getAuthorizationUrl(domain)
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

ipcMain.on('get-access-token', (event: Event, code: string) => {
  auth
    .getAccessToken(code)
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
ipcMain.on('get-social-token', (event: Event) => {
  const token = process.env.SOCIAL_TOKEN
  if (isEmpty(token)) {
    return event.sender.send('error-get-social-token', new EmptyTokenError())
  }
  event.sender.send('response-get-social-token', token)
})

// nedb
ipcMain.on('list-accounts', (event: Event) => {
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

ipcMain.on('get-local-account', (event: Event, id: string) => {
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

ipcMain.on('update-account', (event: Event, acct: LocalAccount) => {
  accountManager
    .refresh(acct)
    .then(ac => {
      event.sender.send('response-update-account', ac)
    })
    .catch(err => {
      event.sender.send('error-update-account', err)
    })
})

ipcMain.on('remove-account', (event: Event, id: string) => {
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

ipcMain.on('forward-account', (event: Event, acct: LocalAccount) => {
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

ipcMain.on('backward-account', (event: Event, acct: LocalAccount) => {
  accountManager
    .backwardAccount(acct)
    .then(() => {
      event.sender.send('response-backward-account')
    })
    .catch(err => {
      event.sender.send('error-backward-account', err)
    })
})

ipcMain.on('refresh-accounts', (event: Event) => {
  accountManager
    .refreshAccounts()
    .then(accounts => {
      event.sender.send('response-refresh-accounts', accounts)
    })
    .catch(err => {
      event.sender.send('error-refresh-accounts', err)
    })
})

ipcMain.on('remove-all-accounts', (event: Event) => {
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

// badge
ipcMain.on('reset-badge', () => {
  if (process.platform === 'darwin') {
    app.dock.setBadge('')
  }
})

// user streaming
let userStreamings: { [key: string]: WebSocket | null } = {}

ipcMain.on('start-all-user-streamings', (event: Event, accounts: Array<LocalAccount>) => {
  accounts.map(async account => {
    const id: string = account._id!
    try {
      const acct = await accountManager.getAccount(id)
      // Stop old user streaming
      if (userStreamings[id]) {
        userStreamings[id]!.stop()
        userStreamings[id] = null
      }
      const url = await StreamingURL(acct)
      userStreamings[id] = new WebSocket(acct, url)
      userStreamings[id]!.startUserStreaming(
        (update: Status) => {
          if (!event.sender.isDestroyed()) {
            event.sender.send(`update-start-all-user-streamings-${id}`, update)
          }
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

ipcMain.on('start-directmessages-streaming', async (event: Event, obj: StreamingSetting) => {
  const { account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old directmessages streaming
    if (directMessagesStreaming !== null) {
      directMessagesStreaming.stop()
      directMessagesStreaming = null
    }

    const url = await StreamingURL(acct)
    directMessagesStreaming = new WebSocket(acct, url)
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

ipcMain.on('start-local-streaming', async (event: Event, obj: StreamingSetting) => {
  const { account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old local streaming
    if (localStreaming !== null) {
      localStreaming.stop()
      localStreaming = null
    }

    const url = await StreamingURL(acct)
    localStreaming = new WebSocket(acct, url)
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

ipcMain.on('start-public-streaming', async (event: Event, obj: StreamingSetting) => {
  const { account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old public streaming
    if (publicStreaming !== null) {
      publicStreaming.stop()
      publicStreaming = null
    }

    const url = await StreamingURL(acct)
    publicStreaming = new WebSocket(acct, url)
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

ipcMain.on('start-list-streaming', async (event: Event, obj: ListID & StreamingSetting) => {
  const { listID, account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old list streaming
    if (listStreaming !== null) {
      listStreaming.stop()
      listStreaming = null
    }

    const url = await StreamingURL(acct)
    listStreaming = new WebSocket(acct, url)
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

ipcMain.on('start-tag-streaming', async (event: Event, obj: Tag & StreamingSetting) => {
  const { tag, account } = obj
  try {
    const acct = await accountManager.getAccount(account._id!)

    // Stop old tag streaming
    if (tagStreaming !== null) {
      tagStreaming.stop()
      tagStreaming = null
    }

    const url = await StreamingURL(acct)
    tagStreaming = new WebSocket(acct, url)
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
ipcMain.on('get-preferences', (event: Event) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences
    .load()
    .then(conf => {
      event.sender.send('response-get-preferences', conf)
    })
    .catch(err => {
      event.sender.send('error-get-preferences', err)
    })
})

ipcMain.on('update-preferences', (event: Event, data: any) => {
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

ipcMain.on('change-collapse', (_event: Event, value: boolean) => {
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

ipcMain.on('get-collapse', (event: Event) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load().then(conf => {
    event.sender.send('response-get-collapse', conf.state.collapse)
  })
})

ipcMain.on('change-global-header', (event: Event, value: boolean) => {
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

ipcMain.on('get-global-header', (event: Event) => {
  const preferences = new Preferences(preferencesDBPath)
  preferences.load().then(conf => {
    event.sender.send('response-get-global-header', conf.state.hideGlobalHeader)
  })
})

ipcMain.on('change-language', (event: Event, value: string) => {
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
ipcMain.on('save-hashtag', (event: Event, tag: string) => {
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

ipcMain.on('list-hashtags', (event: Event) => {
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

ipcMain.on('remove-hashtag', (event: Event, tag: LocalTag) => {
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
ipcMain.on('list-fonts', (event: Event) => {
  Fonts()
    .then(list => {
      event.sender.send('response-list-fonts', list)
    })
    .catch(err => {
      event.sender.send('error-list-fonts', err)
    })
})

// Unread notifications
ipcMain.on('get-unread-notification', (event: Event, accountID: string) => {
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

ipcMain.on('update-unread-notification', (event: Event, config: UnreadNotificationConfig) => {
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
