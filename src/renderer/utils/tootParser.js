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
  return findAccount(target.parentNode)
}
