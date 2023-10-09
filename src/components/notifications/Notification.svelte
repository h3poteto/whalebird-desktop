<script lang="ts">
  import type { Entity } from 'megalodon'
  import Follow from './Follow.svelte'
  import Reaction from './Reaction.svelte'
  import Status from '../statuses/Status.svelte'

  export let notification: Entity.Notification
</script>

<div>
  {#if notification.type === 'follow' || notification.type === 'follow_request'}
    <Follow {notification} />
  {:else if notification.type === 'mention' && notification.status}
    <Status status={notification.status} />
  {:else if notification.type === 'favourite' || notification.type === 'reblog' || notification.type === 'quote' || notification.type === 'poll_expired' || notification.type === 'poll_vote' || notification.type === 'status' || notification.type === 'update' || notification.type === 'emoji_reaction'}
    <Reaction {notification} />
  {/if}
</div>
