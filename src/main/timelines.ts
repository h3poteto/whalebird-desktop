import generator, { detector, ProxyConfig } from 'megalodon'
import { LocalAccount } from '~/src/types/localAccount'
import { EnabledTimelines } from '~/src/types/enabledTimelines'

const confirm = async (account: LocalAccount, proxy: ProxyConfig | false) => {
  const sns = await detector(account.baseURL, proxy)
  const client = generator(sns, account.baseURL, account.accessToken, 'Whalebird', proxy)

  let timelines: EnabledTimelines = {
    home: true,
    notification: true,
    mention: true,
    direct: true,
    favourite: true,
    local: true,
    public: true,
    tag: true,
    list: true
  }

  const notification = async () => {
    return client.getNotifications({ limit: 1 }).catch(() => {
      timelines = { ...timelines, notification: false, mention: false }
    })
  }
  const direct = async () => {
    return client.getConversationTimeline({ limit: 1 }).catch(() => {
      timelines = { ...timelines, direct: false }
    })
  }
  const favourite = async () => {
    return client.getFavourites({ limit: 1 }).catch(() => {
      timelines = { ...timelines, favourite: false }
    })
  }
  const local = async () => {
    return client.getLocalTimeline({ limit: 1 }).catch(() => {
      timelines = { ...timelines, local: false }
    })
  }
  const pub = async () => {
    return client.getPublicTimeline({ limit: 1 }).catch(() => {
      timelines = { ...timelines, public: false }
    })
  }
  const tag = async () => {
    return client.getTagTimeline('whalebird', { limit: 1 }).catch(() => {
      timelines = { ...timelines, tag: false }
    })
  }
  await Promise.all([notification(), direct(), favourite(), local(), pub(), tag()])

  return timelines
}

export default confirm
