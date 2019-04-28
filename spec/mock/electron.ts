import mock from 'electron-ipc-mock'

const instance = mock()
const ipcMain = instance.ipcMain
const ipcRenderer = instance.ipcRenderer
export { ipcMain, ipcRenderer }
