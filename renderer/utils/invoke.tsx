export function invoke(event: string, data: any): Promise<any> {
  if (process.env.NEXT_PUBLIC_CLIENT_ENV !== 'browser') {
    return global.ipc.invoke(event, data)
  }
  switch (event) {
    case 'open-browser':
      window.open(data, '_blank').focus()
      return
    case 'set-proxy':
      console.warn('Can not use proxy in this environment')
      return
    default:
      console.error(`Unknown event: ${event}`)
      return
  }
}
