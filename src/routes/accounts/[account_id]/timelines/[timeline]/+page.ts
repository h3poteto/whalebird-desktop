import { db } from '@/db'
import generator, { type Entity, type MegalodonInterface } from 'megalodon'
import { browser } from '$app/environment'

export async function load({ params }: { params: any }) {
  let client: MegalodonInterface
  let statuses: Array<Entity.Status> = []
  let notifications: Array<Entity.Notification> = []

  if (browser) {
    localStorage.setItem(`${params.account_id}_lastTimeline`, params.timeline)
  }

  const account = await db.accounts.get(parseInt(params.account_id))
  if (!account)
    return {
      statuses: [],
      notifications: [],
      client: undefined
    }

  client = generator(account.sns, account.url, account.access_token, 'Whalebird')

  switch (params.timeline as string) {
    case 'notifications': {
      const res = await client.getNotifications()
      notifications = res.data
      break
    }
    case 'public': {
      const res = await client.getPublicTimeline()
      statuses = res.data
      break
    }
    case 'local': {
      const res = await client.getLocalTimeline()
      statuses = res.data
      break
    }
    case 'home':
    default: {
      const res = await client.getHomeTimeline()
      statuses = res.data
      break
    }
  }

  return {
    timeline: params.timeline,
    account_id: params.account_id,
    account,
    client,
    statuses,
    notifications
  }
}
