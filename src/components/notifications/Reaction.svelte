<script lang="ts">
  import { Avatar } from 'flowbite-svelte'
  import dayjs from 'dayjs'
  import type { Entity } from 'megalodon'
  import emojify from '@/components/utils/emojify'
  import { StarSolid, ArrowsRepeatSolid, BarsSolid, HomeSolid, PenSolid } from 'flowbite-svelte-icons'
  import Card from '../statuses/Card.svelte'
  import Attachments from '../statuses/Attachments.svelte'
  import { _ } from 'svelte-i18n'

  export let notification: Entity.Notification
</script>

{#if notification.account && notification.status}
  <div class="border-b mr-2">
    <div class="flex items-center">
      {#if notification.type === 'favourite'}
        <div class="ml-2">
          <StarSolid class="text-amber-500 mr-2 ml-auto" size="sm" />
        </div>
        <div class="text-gray-600">
          {$_('notifications.favourite', { values: { user: notification.account.username } })}
        </div>
      {:else if notification.type === 'reblog' || notification.type === 'quote'}
        <div class="ml-2">
          <ArrowsRepeatSolid class="text-blue-500 mr-2 ml-auto" size="sm" />
        </div>
        <div class="text-gray-600">
          {$_('notifications.reblog', { values: { user: notification.account.username } })}
        </div>
      {:else if notification.type === 'poll_expired' || notification.type === 'poll_vote'}
        <div class="ml-2">
          <BarsSolid class="text-blue-500 mr-2 ml-auto" size="sm" />
        </div>
        <div class="text-gray-600">
          {#if notification.type === 'poll_expired'}
            {$_('notifications.poll_expired', { values: { user: notification.account.username } })}
          {:else}
            {$_('notifications.poll_vote', { values: { user: notification.account.username } })}
          {/if}
        </div>
      {:else if notification.type === 'status'}
        <div class="ml-2">
          <HomeSolid class="mr-2 ml-auto" size="sm" />
        </div>
        <div class="text-gray-600">
          {$_('notifications.status', { values: { user: notification.account.username } })}
        </div>
      {:else if notification.type === 'update'}
        <div class="ml-2">
          <PenSolid class="text-amber-500 mr-2 ml-auto" size="sm" />
        </div>
        <div class="text-gray-600">
          {$_('notifications.update', { values: { user: notification.account.username } })}
        </div>
      {:else if notification.type === 'emoji_reaction'}
        <div class="ml-2">
          <span class="mr-2 ml-auto">
            {@html notification.emoji}
          </span>
        </div>
        <div class="text-gray-600">
          {$_('notifications.reaction', { values: { user: notification.account.username } })}
        </div>
      {/if}
    </div>
    <div class="flex">
      <div class="avatar p-2">
        <Avatar src={notification.status.account.avatar} rounded />
      </div>
      <div class="body">
        <div class="header flex justify-between">
          <div class="account-name flex">
            <span class="text-gray-600 text-ellipsis break-all overflow-hidden">
              {@html emojify(notification.status.account.display_name, notification.status.account.emojis)}</span
            >
            <span class="text-gray-600 text-ellipsis break-all overflow-hidden">@{notification.status.account.acct}</span>
          </div>
          <div class="date text-gray-600 text-right">
            <time datetime={notification.status.created_at}>
              {dayjs(notification.status.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </time>
          </div>
        </div>
        <div class="body text-gray-600 break-all overflow-hidden">
          {@html emojify(notification.status.content, notification.status.emojis)}
        </div>
        {#if notification.status.card}
          <Card card={notification.status.card} />
        {/if}
        {#if notification.status.media_attachments.length > 0}
          <Attachments attachments={notification.status.media_attachments} />
        {/if}
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
