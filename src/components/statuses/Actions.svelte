<script lang="ts">
  import { Dropdown, DropdownItem } from 'flowbite-svelte'
  import { ArrowsRepeatSolid, BookmarkSolid, DotsHorizontalOutline, ReplySolid, StarSolid } from 'flowbite-svelte-icons'
  import type { Entity, MegalodonInterface } from 'megalodon'
  import { _ } from 'svelte-i18n'

  export let client: MegalodonInterface
  export let status: Entity.Status
  export let onRefresh: () => void

  const boost = async () => {
    if (status.reblogged) {
      await client.unreblogStatus(status.id)
    } else {
      await client.reblogStatus(status.id)
    }
    onRefresh()
  }

  const favourite = async () => {
    if (status.favourited) {
      await client.unfavouriteStatus(status.id)
    } else {
      await client.favouriteStatus(status.id)
    }
    onRefresh()
  }

  const bookmark = async () => {
    if (status.bookmarked) {
      await client.unbookmarkStatus(status.id)
    } else {
      await client.bookmarkStatus(status.id)
    }
    onRefresh()
  }

  const openInBrowser = () => {
    window.ipcRenderer.invoke('open-browser', status.url)
  }
</script>

<div>
  <button><ReplySolid class="text-gray-400 hover:text-blue-500 mr-3" size="sm" /></button>
  <button on:click={boost}>
    {#if status.reblogged}
      <ArrowsRepeatSolid class="text-blue-600 hover:text-blue-500 mr-3" size="sm" />
    {:else}
      <ArrowsRepeatSolid class="text-gray-400 hover:text-blue-500 mr-3" size="sm" />
    {/if}
  </button>
  <button on:click={favourite}>
    {#if status.favourited}
      <StarSolid class="text-orange-400 hover:text-orange-300 mr-3" size="sm" />
    {:else}
      <StarSolid class="text-gray-400 hover:text-orange-300 mr-3" size="sm" />
    {/if}
  </button>
  <button on:click={bookmark}>
    {#if status.bookmarked}
      <BookmarkSolid class="text-rose-500 hover:text-rose-400 mr-3" size="sm" />
    {:else}
      <BookmarkSolid class="text-gray-400 hover:text-rose-400 mr-3" size="sm" />
    {/if}
  </button>
  <button><DotsHorizontalOutline class="text-gray-400 hover:text-blue-500 mr-3" size="sm" /></button>
  <Dropdown>
    <DropdownItem on:click={openInBrowser}>{$_('timeline.actions.open_in_browser')}</DropdownItem>
  </Dropdown>
</div>
