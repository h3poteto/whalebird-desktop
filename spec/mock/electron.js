const { ipcRenderer, ipcMain } = require('electron-ipc-mock')()

module.exports.ipcRenderer = ipcRenderer
module.exports.ipcMain = ipcMain
