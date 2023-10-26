<script lang="ts">
  import type { Entity, MegalodonInterface } from 'megalodon'
  import Follow from './Follow.svelte'
  import Reaction from './Reaction.svelte'
  import Status from '../statuses/Status.svelte'

  export let notification: Entity.Notification
  export let client: MegalodonInterface
  export let updateStatus: (id: string) => void
</script>

<div>
  {#if notification.type === 'follow' || notification.type === 'follow_request'}
    <Follow {notification} />
  {:else if notification.type === 'mention' && notification.status}
    <Status status={notification.status} onRefresh={updateStatus} {client} />
  {:else if notification.type === 'favourite' || notification.type === 'reblog' || notification.type === 'quote' || notification.type === 'poll_expired' || notification.type === 'poll_vote' || notification.type === 'status' || notification.type === 'update' || notification.type === 'emoji_reaction'}
    <Reaction {notification} {updateStatus} {client} />
  {/if}
</div>
