import createIPCMock from 'electron-mock-ipc'

const mocked = createIPCMock()
const ipcMain = mocked.ipcMain
const ipcRenderer = mocked.ipcRenderer

export { ipcMain, ipcRenderer }
