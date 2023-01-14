const electron = require('electron')

global.ipcRenderer = electron.ipcRenderer
global.shell = electron.shell
global.clipboard = electron.clipboard
global.node_env = process.env.NODE_ENV
global.platform = process.platform
