import { QuoteSupportMastodon } from '~/src/constants/servers/quote'

const quoteSupported = (sns: 'mastodon' | 'pleroma' | 'firefish' | 'friendica', domain: string): boolean => {
  if (QuoteSupportMastodon.includes(domain)) {
    return true
  }
  if (sns === 'firefish') {
    return true
  }
  return false
}

export default quoteSupported
