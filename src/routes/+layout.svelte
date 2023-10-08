<script lang="ts">
  import './styles.css'
  import '../app.css'
  import { onMount } from 'svelte'
  import { db, type Account } from '@/db'
  import { Avatar } from 'flowbite-svelte'
  import { PlusSolid } from 'flowbite-svelte-icons'
  import New from '../components/accounts/New.svelte'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  let accounts: Array<Account> = []
  let newAccount: boolean = false
  $: activeAccount = $page.params.account_id

  onMount(async () => {
    accounts = await db.accounts.toArray()
  })

  const openNewAccount = () => {
    newAccount = true
  }

  const closeNewAccount = async () => {
    newAccount = false
    accounts = await db.accounts.toArray()
  }

  const openAccount = (id: number | undefined) => {
    if (id) {
      goto(`/accounts/${id}`)
    }
  }
</script>

<div class="app">
  <main>
    <aside class="w-16 bg-gray-900">
      {#each accounts as account}
        {#if parseInt(activeAccount) === account.id}
          <div class="bg-blue-950 py-2 w-16 border-l-2 box-border cursor-pointer">
            <Avatar src={account.avatar} size="md" class="mx-auto" />
          </div>
        {:else}
          <div class="bg-gray-900 py-2 w-16 cursor-pointer">
            <button class="mx-auto w-16" on:click={() => openAccount(account.id)}>
              <Avatar src={account.avatar} size="md" class="mx-auto" />
            </button>
          </div>
        {/if}
      {/each}
      <div class="text-gray-400 my-auto w-16 cursor-pointer">
        <PlusSolid class="shrink-0 w-5 h-5 mx-auto my-4" on:click={openNewAccount} />
      </div>
    </aside>
    <slot />
    <New opened={newAccount} closeFunc={closeNewAccount} />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    padding: 0;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
