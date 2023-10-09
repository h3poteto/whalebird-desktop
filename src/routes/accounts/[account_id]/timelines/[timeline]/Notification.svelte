<script lang="ts">
  import { Input } from 'flowbite-svelte'
  import type { Entity, MegalodonInterface } from 'megalodon'
  import VirtualScroll from 'svelte-virtual-scroll-list'
  import type { Account } from '@/db'
  import Notification from '@/components/notifications/Notification.svelte'

  export let account: Account | undefined
  export let notifications: Array<Entity.Notification>
  export let client: MegalodonInterface | undefined
  let list: VirtualScroll

  const appendNotifications = async () => {
    const maxId = notifications[notifications.length - 1].id
    const options = { max_id: maxId }
    const append = await loadNotifications(options)
    notifications = [...notifications, ...append]
  }
  const prependNotifications = async () => {}

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
        <Input type="text" placeholder="Search" class="px-4 py-1 bg-blue-800 border-0 text-blue-100 placeholder:text-blue-300" />
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
