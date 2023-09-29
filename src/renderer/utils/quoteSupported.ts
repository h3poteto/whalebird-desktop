import { QuoteSupportMastodon } from '~/src/constants/servers/quote'

const quoteSupported = (_sns: 'mastodon' | 'pleroma', domain: string): boolean => {
  if (QuoteSupportMastodon.includes(domain)) {
    return true
  }
  return false
}

export default quoteSupported
