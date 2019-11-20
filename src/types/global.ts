import { Shell, IpcRenderer, Clipboard } from 'electron'

export interface MyWindow extends Window {
  shell: Shell
  ipcRenderer: IpcRenderer
  clipboard: Clipboard
  process: NodeJS.Process
}
