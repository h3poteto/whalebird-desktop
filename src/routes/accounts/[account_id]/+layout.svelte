<script lang="ts">
  import { db, type Account } from '@/db'
  import { Sidebar, SidebarItem, SidebarWrapper, SidebarGroup } from 'flowbite-svelte'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import generator, { type WebSocketInterface, type Entity } from 'megalodon'
  import { generateNotification } from '@/components/utils/generateNotification'
  import { _ } from 'svelte-i18n'

  let account: Account | undefined
  $: pages = [
    {
      title: $_('timeline.home'),
      path: `/accounts/${accountId}/timelines/home`
    },
    {
      title: $_('timeline.notifications'),
      path: `/accounts/${accountId}/timelines/notifications`
    },
    {
      title: $_('timeline.local'),
      path: `/accounts/${accountId}/timelines/local`
    },
    {
      title: $_('timeline.public'),
      path: `/accounts/${accountId}/timelines/public`
    }
  ]

  $: activeUrl = $page.url.pathname
  $: accountId = $page.params.account_id
  $: accountId, updateAccount(accountId)
  let stream: WebSocketInterface | null = null

  const updateAccount = async (accountId: string) => {
    account = await db.accounts.get(parseInt(accountId))
    if (!account) return
    const c = generator(account.sns, account.url, account.access_token, 'Whalebird')
    const instance = await c.getInstance()
    if (!instance.data.urls?.streaming_api) return
    const client = generator(account.sns, instance.data.urls.streaming_api, account.access_token, 'Whalebird')
    stream = client.userSocket()
    stream.on('notification', async (notification: Entity.Notification) => {
      const [title, body] = generateNotification(notification, $_)
      if (title.length > 0) {
        new Notification(title, { body })
      }
    })
  }

  onMount(async () => {
    account = await db.accounts.get(parseInt(accountId))
  })
</script>

<section class="flex h-screen w-full">
  <Sidebar
    {activeUrl}
    asideClass="h-screen w-56 text-blue-200"
    nonActiveClass="flex items-center p-2 text-base font-normal text-blue-200 rounded-lg hover:bg-blue-900"
    activeClass="flex items-center p-2 text-base font-normal text-gray-800 bg-blue-400 rounded-lg hover:bg-blue-300"
  >
    <SidebarWrapper divClass="overflow-y-auto py-4 px-3 bg-blue-950 h-screen w-56">
      <div class="max-w-full pl-4 mt-2 mb-4">
        <p>{account?.username}</p>
        <p>@{account?.domain}</p>
      </div>
      <SidebarGroup>
        {#each pages as { title, path }}
          <SidebarItem label={title} href={path} />
        {/each}
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
  <slot />
</section>

<style>
</style>
