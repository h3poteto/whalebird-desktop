import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  invoke(channel: string, value: any) {
    return ipcRenderer.invoke(channel, value)
  },
  send(channel: string, value: unknown) {
    return ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  }
}

contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler
