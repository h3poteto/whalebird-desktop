export function findLink (target) {
  if (target.localName === 'a') {
    return target.href
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  if ((target.parentNode.getAttribute('class') === 'toot') ||
      (target.parentNode.getAttribute('class') === 'favourite') ||
      (target.parentNode.getAttribute('class') === 'reblog')) {
    return null
  }
  return findLink(target.parentNode)
}

export function isTag (target) {
  if (target.getAttribute('class') && target.getAttribute('class').includes('hashtag')) {
    return true
  }
  // In Pleroma, link does not have class.
  // So I have to check URL.
  if (target.href && target.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/(tag|tags)\/.+/)) {
    return true
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return false
  }
  if ((target.parentNode.getAttribute('class') === 'toot') ||
      (target.parentNode.getAttribute('class') === 'favourite') ||
      (target.parentNode.getAttribute('class') === 'reblog')) {
    return false
  }
  return isTag(target.parentNode)
}

export function findAccount (target) {
  if (target.getAttribute('class') && target.getAttribute('class').includes('u-url')) {
    return parseAccount(target.href)
  }
  // In Pleroma, link does not have class.
  // So I have to check URL.
  if (target.href && target.href.match(/^https:\/\/[a-zA-Z0-9-.]+\/@[a-zA-Z0-9-_.]+/)) {
    return parseAccount(target.href)
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  if ((target.parentNode.getAttribute('class') === 'toot') ||
      (target.parentNode.getAttribute('class') === 'favourite') ||
      (target.parentNode.getAttribute('class') === 'reblog')) {
    return null
  }
  return findAccount(target.parentNode)
}

export function parseAccount (accountURL) {
  const res = accountURL.match(/^https:\/\/([a-zA-Z0-9-.]+)\/(@[a-zA-Z0-9-_.]+)/)
  const domainName = res[1]
  const accountName = res[2]
  return `${accountName}@${domainName}`
}
