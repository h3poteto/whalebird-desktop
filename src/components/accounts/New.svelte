<script lang="ts">
  import { Button, Modal, Label, Input } from 'flowbite-svelte'
  import generator, { detector, type MegalodonInterface } from 'megalodon'
  import { db } from '../../db'

  export let opened: boolean
  export let closeFunc: () => void
  let domain: string
  let authorizationCode: string
  let sns: 'mastodon' | 'pleroma' | 'friendica' | 'firefish'
  let authURL: string | null = null
  let clientId: string
  let clientSecret: string
  let client: MegalodonInterface
  $: url = 'https://' + domain

  const checkDomain = async () => {
    const res = await detector(url)
    sns = res
    client = generator(sns, url)
    const appData = await client.registerApp('Whalebird', {})
    clientId = appData.client_id
    clientSecret = appData.client_secret
    authURL = appData.url
    window.ipcRenderer.invoke('open-browser', authURL)
    closeFunc()
  }

  const authorize = async () => {
    const tokenData = await client.fetchAccessToken(clientId, clientSecret, authorizationCode)
    client = generator(sns, url, tokenData.access_token, 'Whalebird')
    const acct = await client.verifyAccountCredentials()
    await db.accounts.add({
      username: acct.data.username,
      account_id: acct.data.id,
      avatar: acct.data.avatar,
      client_id: clientId,
      client_secret: clientSecret,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      url: url,
      domain: domain,
      sns: sns
    })
    closeFunc()
  }
</script>

<Modal title="Add account" bind:open={opened} autoclose={false} dismissable={false}>
  {#if sns === undefined}
    <form class="flex flex-col space-y-6" action="#">
      <Label class="space-y-2">
        <span>Domain</span>
        <Input type="text" name="domain" placeholder="mastodon.social" bind:value={domain} required />
      </Label>
      <Button type="submit" class="w-full1" on:click={checkDomain}>Login</Button>
    </form>
  {:else}
    <form class="flex flex-col space-y-6" action="#">
      <p>Please approve in your browser</p>
      <Label class="space-y-2">
        <span>Authorization Code</span>
        <Input type="text" name="authorizationCode" bind:value={authorizationCode} required />
      </Label>
      <Button type="submit" class="w-full1" on:click={authorize}>Authorize</Button>
    </form>
  {/if}
</Modal>
