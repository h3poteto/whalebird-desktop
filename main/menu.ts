import { app, Menu, MenuItem, MenuItemConstructorOptions } from 'electron'

const isDarwin = () => process.platform === 'darwin'

const template: Array<MenuItemConstructorOptions | MenuItem> = [
  ...(isDarwin()
    ? ([
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }
      ] as Array<MenuItemConstructorOptions | MenuItem>)
    : ([] as Array<MenuItem>)),
  {
    label: 'File',
    submenu: [isDarwin() ? { role: 'close' } : { role: 'quit' }]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isDarwin()
        ? ([
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
            }
          ] as Array<MenuItemConstructorOptions>)
        : ([{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }] as Array<MenuItemConstructorOptions>))
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isDarwin()
        ? ([{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }] as Array<MenuItemConstructorOptions>)
        : ([{ role: 'close' }] as Array<MenuItemConstructorOptions>))
    ]
  }
]

export const menu = Menu.buildFromTemplate(template)
