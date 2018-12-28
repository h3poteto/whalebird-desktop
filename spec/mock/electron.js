const { ipcRenderer, ipcMain } = require('electron-ipc-mock')()
// export const ipcRenderer = {
//   send: jest.fn(),
//   on: jest.fn(),
//   once: jest.fn(),
//   removeAllListeners: jest.fn()
// }
module.exports.ipcRenderer = ipcRenderer
module.exports.ipcMain = ipcMain
