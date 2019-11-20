import createIPCMock from 'electron-mock-ipc'
import { IpcRenderer, IpcMain } from 'electron'

const mocked = createIPCMock()
const ipcMain = mocked.ipcMain as IpcMain
const ipcRenderer = mocked.ipcRenderer as IpcRenderer

export { ipcMain, ipcRenderer }
