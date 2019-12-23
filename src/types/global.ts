import { Shell, IpcRenderer, Clipboard } from 'electron'

export interface MyWindow extends Window {
  shell: Shell
  ipcRenderer: IpcRenderer
  clipboard: Clipboard
  node_env: string
  platform: string
  static_path: string
}
