<script lang="ts">
  import './styles.css'
  import '../app.css'
  import { onMount } from 'svelte'
  import { db, type Account } from '@/db'
  import { Avatar } from 'flowbite-svelte'

  let accounts: Array<Account> = []

  onMount(async () => {
    accounts = await db.accounts.toArray()
  })
</script>

<div class="app">
  <main>
    <aside class="w-16 bg-gray-900">
      {#each accounts as account}
        <div class="bg-blue-950 py-2">
          <Avatar src={account.avatar} size="md" class="mx-auto" />
        </div>
      {/each}
    </aside>
    <slot />
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
