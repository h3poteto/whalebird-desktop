<script lang="ts">
  import { tick } from 'svelte'
  import { Input } from 'flowbite-svelte'
  import generator, { type Entity, type MegalodonInterface, type WebSocketInterface } from 'megalodon'
  import VirtualScroll from 'svelte-virtual-scroll-list'
  import type { Account } from '@/db'
  import Notification from '@/components/notifications/Notification.svelte'
  import { onMount } from 'svelte'
  import { onNavigate } from '$app/navigation'

  export let account: Account | undefined
  export let notifications: Array<Entity.Notification>
  export let client: MegalodonInterface | undefined
  let list: VirtualScroll
  let stream: WebSocketInterface | null = null
  let unreadNotifications: Array<Entity.Notification> = []

  onMount(async () => {
    if (!client) return
    if (!account) return
    const instance = await client.getInstance()
    if (!instance.data.urls?.streaming_api) return
    const c = generator(account.sns, instance.data.urls.streaming_api, account.access_token, 'Whalebird')
    stream = c.userSocket()
    stream.on('connect', () => {
      console.log(`connected to notifications in ${instance.data.urls!.streaming_api}`)
    })
    stream.on('notification', notification => {
      if (list && list.getOffset() > 10) {
        unreadNotifications = [notification, ...unreadNotifications]
      } else {
        notifications = [notification, ...notifications]
      }
    })
  })

  onNavigate(() => {
    if (stream) {
      stream.removeAllListeners()
      stream.stop()
      stream = null
      console.log(`closed notifications`)
    }
  })

  const appendNotifications = async () => {
    const maxId = notifications[notifications.length - 1].id
    const options = { max_id: maxId }
    const append = await loadNotifications(options)
    notifications = [...notifications, ...append]
  }
  const prependNotifications = async () => {
    const prepend = [...unreadNotifications]
    notifications = [...unreadNotifications, ...notifications]
    unreadNotifications = []

    tick().then(() => {
      const sids = prepend.map(i => i.id)
      // @ts-ignore
      const offset = sids.reduce((previousValue, currentSid) => previousValue + list.getSize(currentSid), 0)
      list.scrollToOffset(offset)
    })
  }

  const loadNotifications = async (options: any) => {
    if (!client) return []
    const res = await client.getNotifications(options)
    return res.data
  }
</script>

<section class="h-full notification-wrapper">
  <div class="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
    <div class="text-lg font-bold">Notifications</div>
    <div class="w-64 text-xs">
      <form>
        <Input type="text" placeholder="Search" class="px-4 py-1 bg-blue-800 border-0 text-blue-100 placeholder:text-blue-300" disabled />
      </form>
    </div>
  </div>
  <div class="notification overflow-y-auto">
    <div class="h-full">
      <VirtualScroll
        bind:this={list}
        data={notifications}
        key="id"
        let:data
        on:bottom={() => appendNotifications()}
        on:top={() => prependNotifications()}
        start={0}
        pageMode={false}
      >
        <Notification notification={data} />
      </VirtualScroll>
    </div>
  </div>
</section>

<style>
  .notification-wrapper {
    width: calc(100% - 224px);
  }

  .notification {
    height: calc(100% - 44px);
  }
</style>
