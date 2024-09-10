import path from 'path'
import { app, ipcMain, shell, IpcMainInvokeEvent, BrowserWindow } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let main: BrowserWindow = null

;(async () => {
  await app.whenReady()

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
