<script lang="ts">
  import { Avatar } from 'flowbite-svelte'
  import type { Entity } from 'megalodon'
  import { StarSolid, ArrowsRepeatSolid, BarsSolid, HomeSolid, PenSolid } from 'flowbite-svelte-icons'

  export let notification: Entity.Notification
</script>

{#if notification.account && notification.status}
  <div class="flex items-center">
    {#if notification.type === 'favourite'}
      <div class="ml-2">
        <StarSolid class="text-amber-500 mr-2 ml-auto" size="sm" />
      </div>
      <div class="text-gray-600">
        {notification.account.username} favourited your post
      </div>
    {:else if notification.type === 'reblog' || notification.type === 'quote'}
      <div class="ml-2">
        <ArrowsRepeatSolid class="text-blue-500 mr-2 ml-auto" size="sm" />
      </div>
      <div class="text-gray-600">
        {notification.account.username} boosted your post
      </div>
    {:else if notification.type === 'poll_expired' || notification.type === 'poll_vote'}
      <div class="ml-2">
        <BarsSolid class="text-blue-500 mr-2 ml-auto" size="sm" />
      </div>
      <div class="text-gray-600">
        {#if notification.type === 'poll_expired'}
          poll is expired
        {:else}
          voted your poll
        {/if}
      </div>
    {:else if notification.type === 'status'}
      <div class="ml-2">
        <HomeSolid class="mr-2 ml-auto" size="sm" />
      </div>
      <div class="text-gray-600">
        {notification.account.username} just post
      </div>
    {:else if notification.type === 'update'}
      <div class="ml-2">
        <PenSolid class="text-amber-500 mr-2 ml-auto" size="sm" />
      </div>
      <div class="text-gray-600">
        {notification.account.username} update the post
      </div>
    {:else if notification.type === 'emoji_reaction'}
      <div class="ml-2">
        <span class="mr-2 ml-auto">
          {@html notification.emoji}
        </span>
      </div>
      <div class="text-gray-600">
        {notification.account.username} react your post
      </div>
    {/if}
  </div>
  <div class="flex">
    <div class="avatar m-2">
      <Avatar src={notification.status.account.avatar} rounded />
    </div>
    <div class="body">
      <div class="flex">
        <div class="text-gray-600 mr-1">
          {notification.status.account.display_name}
        </div>
        <div>
          @{notification.status.account.acct}
        </div>
      </div>
      <div class="status text-gray-600">
        {@html notification.status.content}
      </div>
    </div>
  </div>
{/if}

<style>
  .avatar {
    width: 56px;
  }

  .body {
    width: calc(100% - 56px);
  }
</style>
