import { QuoteSupportMastodon } from '~/src/constants/servers/quote'

const quoteSupported = (sns: 'mastodon' | 'pleroma' | 'misskey', domain: string): boolean => {
  if (sns === 'misskey') {
    return true
  }
  if (QuoteSupportMastodon.includes(domain)) {
    return true
  }
  return false
}

export default quoteSupported
