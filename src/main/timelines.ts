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

  try {
    await client.getHomeTimeline({ limit: 1 })
  } catch (err) {
    timelines = { ...timelines, home: false }
  }

  try {
    await client.getNotifications({ limit: 1 })
  } catch (err) {
    timelines = { ...timelines, notification: false, mention: false }
  }

  try {
    await client.getConversationTimeline({ limit: 1 })
  } catch (err) {
    timelines = { ...timelines, direct: false }
  }

  try {
    await client.getFavourites({ limit: 1 })
  } catch (err) {
    timelines = { ...timelines, favourite: false }
  }

  try {
    await client.getLocalTimeline({ limit: 1 })
  } catch (err) {
    timelines = { ...timelines, local: false }
  }

  try {
    await client.getPublicTimeline({ limit: 1 })
  } catch (err) {
    timelines = { ...timelines, public: false }
  }

  try {
    await client.getTagTimeline('whalebird', { limit: 1 })
  } catch (err) {
    timelines = { ...timelines, tag: false }
  }

  return timelines
}

export default confirm
