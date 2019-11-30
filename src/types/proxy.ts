export enum ProxySource {
  no = 'no',
  system = 'system',
  manual = 'manual'
}

export enum ProxyProtocol {
  http = 'http',
  https = 'https',
  socks4 = 'socks4',
  socks4a = 'socks4a',
  socks5 = 'socks5',
  socks5h = 'socks5h'
}

export type ManualProxy = {
  protocol: '' | ProxyProtocol
  host: string
  port: string
  username: string
  password: string
}

export type Proxy = {
  source: ProxySource
  manualProxyConfig: ManualProxy
}
