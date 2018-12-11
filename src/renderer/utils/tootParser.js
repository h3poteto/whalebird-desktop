export function findLink (target, parentClass = 'toot') {
  if (target.localName === 'a') {
    return target.href
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  if (target.parentNode.getAttribute('class') === parentClass) {
    return null
  }
  return findLink(target.parentNode, parentClass)
}

export function findTag (target, parentClass = 'toot') {
  if (target.getAttribute('class') && target.getAttribute('class').includes('hashtag')) {
    return parseTag(target.href)
  }
  // In Pleroma, link does not have class.
  // So I have to check URL.
  if (target.href && target.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/(tag|tags)\/.+/)) {
    return parseTag(target.href)
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  if (target.parentNode.getAttribute('class') === parentClass) {
    return null
  }
  return findTag(target.parentNode, parentClass)
}

export function parseTag (tagURL) {
  const res = tagURL.match(/^https:\/\/([a-zA-Z0-9-.]+)\/(tag|tags)\/(.+)/)
  return res[3]
}

export function findAccount (target, parentClass = 'toot') {
  if (target.getAttribute('class') && target.getAttribute('class').includes('u-url')) {
    if (target.href && target.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/users\/[a-zA-Z0-9-_.]+/)) {
      return parsePleromaAccount(target.href)
    } else {
      return parseMastodonAccount(target.href)
    }
  }
  // In Pleroma, link does not have class.
  // So we have to check URL.
  if (target.href && target.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/@[a-zA-Z0-9-_.]+/)) {
    return parseMastodonAccount(target.href)
  }
  // Toot URL of Pleroma does not contain @.
  if (target.href && target.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/users\/[a-zA-Z0-9-_.]+/)) {
    return parsePleromaAccount(target.href)
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  if (target.parentNode.getAttribute('class') === parentClass) {
    return null
  }
  return findAccount(target.parentNode, parentClass)
}

export function parseMastodonAccount (accountURL) {
  const res = accountURL.match(/^https:\/\/([a-zA-Z0-9-.]+)\/(@[a-zA-Z0-9-_.]+)/)
  const domainName = res[1]
  const accountName = res[2]
  return {
    username: accountName,
    acct: `${accountName}@${domainName}`,
    url: accountURL
  }
}

export function parsePleromaAccount (accountURL) {
  const res = accountURL.match(/^https:\/\/([a-zA-Z0-9-.]+)\/users\/([a-zA-Z0-9-_.]+)/)
  const domainName = res[1]
  const accountName = res[2]
  return {
    username: accountName,
    acct: `${accountName}@${domainName}`,
    url: accountURL
  }
}
