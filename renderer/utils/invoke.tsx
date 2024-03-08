export function invoke(event: string, data: any) {
  if (process.env.NEXT_PUBLIC_CLIENT_ENV !== 'browser') {
    global.ipc.invoke(event, data)
    return
  }
  switch (event) {
    case 'open-browser':
      window.open(data, '_blank').focus()
      return
    default:
      console.error(`Unknown event: ${event}`)
      return
  }
}
