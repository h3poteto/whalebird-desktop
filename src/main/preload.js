const electron = require('electron')
global.ipcRenderer = electron.ipcRenderer
global.shell = electron.shell
global.clipboard = electron.clipboard
global.process = process
