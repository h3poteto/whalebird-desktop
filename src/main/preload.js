const electron = require('electron')

global.ipcRenderer = electron.ipcRenderer
global.node_env = process.env.NODE_ENV
global.platform = process.platform
