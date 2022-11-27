
import { faL } from "@fortawesome/free-solid-svg-icons"
type Account = {
  username: string
  acct: string
  url: string
}

export function findLink(target: HTMLElement | null, parentClass = 'toot'): string | null {
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
  if (parent.getAttribute('class') === parentClass) {
    return null
  }
  return findLink(parent, parentClass)
}

export function findTag(target: HTMLElement, parentClass = 'toot'): string | null {
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
  if (parent.getAttribute('class') === parentClass) {
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

export function findAccount(target: HTMLElement, parentClass = 'toot'): Account | null {
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
  if (parent.getAttribute('class') === parentClass) {
    return null
  }
  return findAccount(parent, parentClass)
}

export function parseMastodonAccount(accountURL: string): Account | null {
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

export function parsePleromaAccount(accountURL: string): Account | null {
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

export function isRTL(content: string): boolean {
  // Remove all non-Letter characters from the contents.
  const nonLetters = /[^\p{Letter}]/gu;
  const paragraph_begin = /^<p>/u
  const noBeginTag = content.replace(paragraph_begin, "")
  const lettersOnly = noBeginTag.replace(nonLetters, "")

  //based on the first character check if Hebrew or Arabic
  const isRTL = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/u;
  return isRTL.test(lettersOnly);  
}
