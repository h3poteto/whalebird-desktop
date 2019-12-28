const electron = require('electron')
const path = require('path')
const mod = require('module')

global.ipcRenderer = electron.ipcRenderer
global.shell = electron.shell
global.clipboard = electron.clipboard
global.node_env = process.env.NODE_ENV
global.platform = process.platform
global.path = path
global.mod = mod
global.static_path = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
