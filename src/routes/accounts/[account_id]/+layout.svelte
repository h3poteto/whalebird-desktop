<script lang="ts">
  import { db, type Account } from '@/db'
  import { Sidebar, SidebarItem, SidebarWrapper, SidebarGroup } from 'flowbite-svelte'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'

  export let data

  let account: Account | undefined
  const pages = [
    {
      title: 'Home',
      path: `/accounts/${data.id}/timelines/home`
    },
    {
      title: 'Local',
      path: `/accounts/${data.id}/timelines/local`
    },
    {
      title: 'Public',
      path: `/accounts/${data.id}/timelines/public`
    }
  ]

  $: activeUrl = $page.url.pathname

  onMount(async () => {
    account = await db.accounts.get(parseInt(data.id))
  })
</script>

<section class="flex h-screen w-full">
  <Sidebar
    {activeUrl}
    asideClass="h-screen w-56 text-blue-200"
    nonActiveClass="flex items-center p-2 text-base font-normal text-blue-200 rounded-lg hover:bg-blue-900"
    activeClass="flex items-center p-2 text-base font-normal text-gray-800 bg-blue-400 rounded-lg hover:bg-blue-300"
  >
    <SidebarWrapper divClass="overflow-y-auto py-4 px-3 bg-blue-950 h-screen">
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
