<script lang="ts">
  import type { Account } from '@/db'
  import { Avatar, Dropdown, DropdownItem } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'

  export let account: Account
  export let openAccount: (id: number | undefined) => void
  export let removeAccount: (id: number | undefined) => void

  let open = false

  const contextMenu = () => {
    if (open === true) {
      open = false
    } else {
      open = true
    }
  }

  const onClick = () => {
    open = false
    openAccount(account.id)
  }

  const remove = () => {
    open = false
    removeAccount(account.id)
  }
</script>

<div class="bg-gray-900 py-2 w-16 cursor-pointer">
  <button class="mx-auto w-16" on:click={onClick} on:contextmenu|preventDefault={contextMenu}>
    <Avatar src={account.avatar} size="md" class="mx-auto" />
  </button>
  <div id="dummy"></div>
  <Dropdown bind:open triggeredBy="#dummy" placement="right" containerClass="bg-indigo-900 shadow shadow-indigo-950">
    <DropdownItem defaultClass="font-medium py-2 px-4 text-gray-200 text-sm hover:bg-indigo-700" on:click={remove}
      >{$_('navigation.remove')}</DropdownItem
    >
  </Dropdown>
</div>
