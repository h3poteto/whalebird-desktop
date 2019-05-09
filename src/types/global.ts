import { Shell, IpcRenderer } from 'electron'

export interface MyWindow extends Window {
  shell: Shell
  ipcRenderer: IpcRenderer
  process: NodeJS.Process
}
