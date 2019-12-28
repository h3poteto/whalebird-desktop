import path from 'path'
import ProxyConfiguration from '~/src/main/proxy'
import { ManualProxy, ProxyProtocol } from '~/src/types/proxy'

const preferencesDBPath = path.resolve(__dirname, '../../preferences.json')
const proxyConfiguration = new ProxyConfiguration(preferencesDBPath)

// electron.app is using in electron-json-storage
jest.mock('electron', () => ({
  app: jest.fn()
}))

describe('Parser', () => {
  it('do not use proxy', () => {
    proxyConfiguration.setSystemProxy('DIRECT')
    const proxy = proxyConfiguration.parseSystemProxy()
    expect(proxy).toEqual(false)
  })

  it('HTTP and HTTPS proxy', () => {
    proxyConfiguration.setSystemProxy('PROXY hoge.example.com:8080')
    const proxy = proxyConfiguration.parseSystemProxy()
    expect(proxy).not.toBe(false)
    const manualProxy = proxy as ManualProxy
    expect(manualProxy.protocol).toEqual(ProxyProtocol.http)
    expect(manualProxy.host).toEqual('hoge.example.com')
    expect(manualProxy.port).toEqual('8080')
  })

  it('SOCKS4 proxy', () => {
    proxyConfiguration.setSystemProxy('SOCKS4 hoge.example.com:8080')
    const proxy = proxyConfiguration.parseSystemProxy()
    expect(proxy).not.toBe(false)
    const manualProxy = proxy as ManualProxy
    expect(manualProxy.protocol).toEqual(ProxyProtocol.socks4)
  })
  it('SOCKS4A proxy', () => {
    proxyConfiguration.setSystemProxy('SOCKS4A hoge.example.com:8080')
    const proxy = proxyConfiguration.parseSystemProxy()
    expect(proxy).not.toBe(false)
    const manualProxy = proxy as ManualProxy
    expect(manualProxy.protocol).toEqual(ProxyProtocol.socks4a)
  })
  it('SOCKS5 proxy', () => {
    proxyConfiguration.setSystemProxy('SOCKS5 hoge.example.com:8080')
    const proxy = proxyConfiguration.parseSystemProxy()
    expect(proxy).not.toBe(false)
    const manualProxy = proxy as ManualProxy
    expect(manualProxy.protocol).toEqual(ProxyProtocol.socks5)
  })
  it('SOCKS5H proxy', () => {
    proxyConfiguration.setSystemProxy('SOCKS5H hoge.example.com:8080')
    const proxy = proxyConfiguration.parseSystemProxy()
    expect(proxy).not.toBe(false)
    const manualProxy = proxy as ManualProxy
    expect(manualProxy.protocol).toEqual(ProxyProtocol.socks5h)
  })
  it('SOCKS proxy', () => {
    proxyConfiguration.setSystemProxy('SOCKS hoge.example.com:8080')
    const proxy = proxyConfiguration.parseSystemProxy()
    expect(proxy).not.toBe(false)
    const manualProxy = proxy as ManualProxy
    expect(manualProxy.protocol).toEqual(ProxyProtocol.socks5)
  })
})
