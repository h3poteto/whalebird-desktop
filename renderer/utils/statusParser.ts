import { Entity } from 'megalodon'

export type ParsedAccount = {
  username: string
  acct: string
  url: string
}

export function findLink(target: HTMLElement | null, parentClassName: string): string | null {
  if (!target) {
    return null
  }
  if (target.localName === 'a') {
    return (target as HTMLLinkElement).href
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  const parent = target.parentNode as HTMLElement
  if (parent.getAttribute && parent.getAttribute('class') === parentClassName) {
    return null
  }
  return findLink(parent, parentClassName)
}

export function findTag(target: HTMLElement, parentClass = 'toot'): string | null {
  if (!target || !target.getAttribute) {
    return null
  }
  const targetClass = target.getAttribute('class')
  if (targetClass && targetClass.includes('hashtag')) {
    return parseTag((target as HTMLLinkElement).href)
  }
  // In Pleroma, link does not have class.
  // So I have to check URL.
  const link = target as HTMLLinkElement
  if (link.href && link.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/(tag|tags)\/.+/)) {
    return parseTag(link.href)
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  const parent = target.parentNode as HTMLElement
  if (parent.getAttribute && parent.getAttribute('class') === parentClass) {
    return null
  }
  return findTag(parent, parentClass)
}

function parseTag(tagURL: string): string | null {
  const res = tagURL.match(/^https:\/\/([a-zA-Z0-9-.]+)\/(tag|tags)\/(.+)/)
  if (!res) {
    return null
  }
  return res[3]
}

export function findAccount(target: HTMLElement | null, parentClassName: string): ParsedAccount | null {
  if (!target || !target.getAttribute) {
    return null
  }

  const targetClass = target.getAttribute('class')
  const link = target as HTMLLinkElement
  if (targetClass && targetClass.includes('u-url')) {
    if (link.href && link.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/users\/[a-zA-Z0-9-_.]+$/)) {
      return parsePleromaAccount(link.href)
    } else {
      return parseMastodonAccount(link.href)
    }
  }
  // In Pleroma, link does not have class.
  // So we have to check URL.
  if (link.href && link.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/@[a-zA-Z0-9-_.]+$/)) {
    return parseMastodonAccount(link.href)
  }
  // Toot URL of Pleroma does not contain @.
  if (link.href && link.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/users\/[a-zA-Z0-9-_.]+$/)) {
    return parsePleromaAccount(link.href)
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  const parent = target.parentNode as HTMLElement
  if (parent.getAttribute && parent.getAttribute('class') === parentClassName) {
    return null
  }
  return findAccount(parent, parentClassName)
}

export function parseMastodonAccount(accountURL: string): ParsedAccount | null {
  const res = accountURL.match(/^https:\/\/([a-zA-Z0-9-.]+)\/(@[a-zA-Z0-9-_.]+)$/)
  if (!res) {
    return null
  }
  const domainName = res[1]
  const accountName = res[2]
  return {
    username: accountName,
    acct: `${accountName}@${domainName}`,
    url: accountURL
  }
}

export function parsePleromaAccount(accountURL: string): ParsedAccount | null {
  const res = accountURL.match(/^https:\/\/([a-zA-Z0-9-.]+)\/users\/([a-zA-Z0-9-_.]+)$/)
  if (!res) {
    return null
  }
  const domainName = res[1]
  const accountName = res[2]
  return {
    username: `@${accountName}`,
    acct: `@${accountName}@${domainName}`,
    url: accountURL
  }
}

export function accountMatch(findAccounts: Array<Entity.Account>, parsedAccount: ParsedAccount, domain: string): Entity.Account | false {
  const account = findAccounts.find(a => `@${a.acct}` === parsedAccount.acct)
  if (account) return account
  const pleromaUser = findAccounts.find(a => a.acct === parsedAccount.acct)
  if (pleromaUser) return pleromaUser
  const localUser = findAccounts.find(a => `@${a.username}@${domain}` === parsedAccount.acct)
  if (localUser) return localUser
  const user = findAccounts.find(a => a.url === parsedAccount.url)
  if (!user) return false
  return user
}
