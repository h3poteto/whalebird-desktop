<script lang="ts">
  import Timeline from './Timeline.svelte'
  import Notification from './Notification.svelte'
  import Conversation from './Conversation.svelte'

  export let data
</script>

{#if data.timeline === 'notifications'}
  <Notification account={data.account} notifications={data.notifications} client={data.client} />
{:else if data.timeline === 'direct'}
  <Conversation account={data.account} conversations={data.conversations} client={data.client} />
{:else}
  <Timeline timeline={data.timeline} account={data.account} statuses={data.statuses} client={data.client} />
{/if}
