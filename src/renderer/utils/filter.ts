import { Entity } from 'megalodon'

// refs: https://github.com/tootsuite/mastodon/blob/c3aef491d66aec743a3a53e934a494f653745b61/app/javascript/mastodon/selectors/index.js#L43

const filtered = (status: string, filters: Array<Entity.Filter>): boolean => {
  if (filters.length === 0) {
    return false
  }

  const regexp = filterRegexp(filters)
  return status.match(regexp) !== null
}

const filterRegexp = (filters: Array<Entity.Filter>): RegExp => {
  return new RegExp(
    filters
      .map(f => {
        let exp = escapeRegExp(f.phrase)

        if (f.whole_word) {
          if (/^[\w]/.test(exp)) {
            exp = `\\b${exp}`
          }

          if (/[\w]$/.test(exp)) {
            exp = `${exp}\\b`
          }
        }
        return exp
      })
      .join('|'),
    'i'
  )
}

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default filtered
