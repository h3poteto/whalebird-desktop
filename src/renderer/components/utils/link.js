export function findLink (target) {
  if (target.localName === 'a') {
    return target.href
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  if (target.parentNode.getAttribute('class') === 'toot') {
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
  if (target.parentNode.getAttribute('class') === 'toot') {
    return false
  }
  return isTag(target.parentNode)
}
