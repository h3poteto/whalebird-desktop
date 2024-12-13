import path from 'path'
import { app, ipcMain, shell, IpcMainInvokeEvent, BrowserWindow, Menu, clipboard } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { menu } from './menu'
import SystemFonts from 'system-font-families'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let main: BrowserWindow = null

;(async () => {
  await app.whenReady()

  Menu.setApplicationMenu(menu)

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  main = mainWindow

  if (isProd) {
    await mainWindow.loadURL('app://./')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/`)
    mainWindow.webContents.openDevTools()
  }

  mainWindow.webContents.on('context-menu', (_event, properties) => {
    const { editFlags } = properties
    const hasText = properties.selectionText.length > 0
    const can = (type: string) => editFlags[`can${type}`] && hasText
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Select All',
        click: () => {
          mainWindow.webContents.selectAll()
        }
      },
      {
        label: 'Copy',
        enabled: can('Copy'),
        visible: properties.isEditable || hasText,
        click: () => {
          const target = mainWindow.webContents
          if (target) {
            target.copy()
          } else {
            clipboard.writeText(properties.selectionText)
          }
        }
      },
      {
        label: 'Cut',
        enabled: can('Cut'),
        visible: properties.isEditable || hasText,
        click: () => {
          const target = mainWindow.webContents
          if (target) {
            target.cut()
          } else {
            clipboard.writeText(properties.selectionText)
          }
        }
      },
      {
        label: 'Paste',
        enabled: editFlags.canPaste,
        visible: properties.isEditable,
        click: () => {
          const target = mainWindow.webContents
          if (target) {
            target.paste()
          }
        }
      },
      {
        label: 'Save Image As',
        visible: properties.mediaType === 'image',
        click: () => {
          console.log(properties.srcURL)
          mainWindow.webContents.downloadURL(properties.srcURL)
        }
      },
      {
        label: 'Copy Link',
        visible: properties.linkURL.length > 0 && properties.mediaType === 'none',
        click: () => {
          clipboard.write({
            bookmark: properties.linkText,
            text: properties.linkURL
          })
        }
      }
    ])
    contextMenu.popup({ window: mainWindow })
  })
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

ipcMain.handle('open-browser', (_event: IpcMainInvokeEvent, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle('set-proxy', (_event: IpcMainInvokeEvent, data: any) => {
  if (main === null) return
  const { mode, protocol, host, port } = data
  switch (mode) {
    case 'os':
      console.log('Using system proxy')
      main.webContents.session.setProxy({ mode: 'system' })
      break
    case 'manual':
      console.log(`Using proxy: ${protocol}=${host}:${port}`)
      main.webContents.session.setProxy({
        proxyRules: `${protocol}=${host}:${port}`
      })
      break
    default:
      console.log('No proxy configuration')
      main.webContents.session.setProxy({ mode: 'direct' })
      break
  }
})

ipcMain.handle('list-fonts', async (_event: IpcMainInvokeEvent) => {
  const systemFonts = new SystemFonts()
  const res = await systemFonts.getFonts()
  return Array.from(new Set(res)).sort()
})
