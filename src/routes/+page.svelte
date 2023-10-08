<script lang="ts">
  import whalebird_icon from '$lib/images/whalebird.png'
  import { onMount } from 'svelte'
  import New from '../components/accounts/New.svelte'
  import { db } from '../db'
  import { goto } from '$app/navigation'

  let newAccount: boolean = false

  onMount(async () => {
    const accounts = await db.accounts.toArray()
    if (accounts.length === 0) {
      newAccount = true
    } else {
      goto(`/accounts/${accounts[0].id}`)
    }
  })

  const closeNewAccount = async () => {
    newAccount = false
    const accounts = await db.accounts.toArray()
    if (accounts.length === 0) {
      newAccount = true
    } else {
      goto(`/accounts/${accounts[0].id}`)
    }
  }
</script>

<svelte:head>
  <title>Whalebird</title>
  <meta name="description" content="Fediverse client" />
</svelte:head>

<section>
  <img class="w-16" src={whalebird_icon} alt="Whalebird" />
  <New opened={newAccount} closeFunc={closeNewAccount} />
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }
</style>
