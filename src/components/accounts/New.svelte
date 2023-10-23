<script lang="ts">
  import { Button, Modal, Label, Input } from 'flowbite-svelte'
  import generator, { detector, type MegalodonInterface } from 'megalodon'
  import { db } from '../../db'
  import { _ } from 'svelte-i18n'

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
        <span>{$_('servers.new.domain')}</span>
        <Input type="text" name="domain" placeholder="mastodon.social" bind:value={domain} required />
      </Label>
      <div class="flex">
        <Button class="w-1/2 mx-1" color="alternative" on:click={closeFunc}>{$_('servers.new.cancel')}</Button>
        <Button type="submit" class="w-1/2 mx-1" on:click={checkDomain}>{$_('servers.new.login')}</Button>
      </div>
    </form>
  {:else}
    <form class="flex flex-col space-y-6" action="#">
      <p>{$_('servers.new.description')}</p>
      <Label class="space-y-2">
        <span>{$_('servers.new.authorization_code')}</span>
        <Input type="text" name="authorizationCode" bind:value={authorizationCode} required />
      </Label>
      <div class="flex">
        <Button class="w-1/2 mx-1" color="alternative" on:click={closeFunc}>{$_('servers.new.cancel')}</Button>
        <Button type="submit" class="w-1/2 mx-1" on:click={authorize}>{$_('servers.new.authorize')}</Button>
      </div>
    </form>
  {/if}
</Modal>
