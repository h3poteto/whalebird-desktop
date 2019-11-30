import { ProxyConfig } from 'megalodon'
import { ProxySource, ManualProxy, ProxyProtocol } from '~/src/types/proxy'
import Preferences from './preferences'

export default class ProxyConfiguration {
  public preferences: Preferences
  public systemProxy: string | null = null

  constructor(preferencesDBPath: string) {
    this.preferences = new Preferences(preferencesDBPath)
  }

  public setSystemProxy(proxy: string) {
    this.systemProxy = proxy
  }

  public async forMastodon(): Promise<false | ProxyConfig> {
    const proxy = await this.getConfig()
    if (!proxy) {
      return false
    } else {
      let protocol = ProxyProtocol.http
      if (proxy.protocol !== '') {
        protocol = proxy.protocol
      }
      if (proxy.username.length > 0) {
        return {
          host: proxy.host,
          port: parseInt(proxy.port, 10),
          protocol: protocol,
          auth: {
            username: proxy.username,
            password: proxy.password
          }
        }
      } else {
        return {
          host: proxy.host,
          port: parseInt(proxy.port, 10),
          protocol: protocol
        }
      }
    }
  }

  public async getConfig(): Promise<false | ManualProxy> {
    const conf = await this.preferences.get()
    const source = conf.proxy.source as ProxySource
    switch (source) {
      case ProxySource.no:
        return false
      case ProxySource.system:
        if (this.systemProxy) {
          return this.parseSystemProxy()
        } else {
          return false
        }
      case ProxySource.manual:
        return conf.proxy.manualProxyConfig
    }
  }

  public parseSystemProxy(): ManualProxy | false {
    if (!this.systemProxy) {
      return false
    }
    if (this.systemProxy === 'DIRECT') {
      return false
    }
    const result = this.systemProxy.match(/^([A-Z0-9]+)\s+([a-z0-9-_.]+):([0-9]+)$/)
    if (!result || result.length !== 4) {
      return false
    }
    let protocol = ProxyProtocol.http
    switch (result[1]) {
      case 'PROXY':
        protocol = ProxyProtocol.http
        break
      case 'SOCKS4':
        protocol = ProxyProtocol.socks4
        break
      case 'SOCKS4A':
        protocol = ProxyProtocol.socks4a
        break
      case 'SOCKS5':
        protocol = ProxyProtocol.socks5
        break
      case 'SOCKS5H':
        protocol = ProxyProtocol.socks5h
        break
      case 'SOCKS':
        protocol = ProxyProtocol.socks5
        break
    }
    const manual: ManualProxy = {
      protocol: protocol,
      host: result[2],
      port: result[3],
      username: '',
      password: ''
    }
    return manual
  }
}
