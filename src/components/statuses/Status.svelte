<script lang="ts">
  import { Avatar } from 'flowbite-svelte'
  import type { Entity, MegalodonInterface } from 'megalodon'
  import dayjs from 'dayjs'
  import emojify from '@/components/utils/emojify'
  import Card from './Card.svelte'
  import Attachments from './Attachments.svelte'
  import Poll from './Poll.svelte'

  export let status: Entity.Status
  export let client: MegalodonInterface
  export let onRefresh: (id: string) => void
  $: originalStatus = status.reblog && !status.quote ? status.reblog : status
</script>

<div class="border-b mr-2 py-1">
  {#if status.reblog && !status.quote}
    <div class="flex">
      <div class="avatar grid justify-items-end pr-2">
        <Avatar src={status.account.avatar} rounded size="xs" />
      </div>
      <div class="status">
        {status.account.username} boosted
      </div>
    </div>
  {/if}
  <div class="flex">
    <div class="avatar p-2">
      <Avatar src={originalStatus.account.avatar} rounded />
    </div>
    <div class="status relative">
      <div class="header flex justify-between">
        <div class="account-name flex">
          <span class="text-gray-950 text-ellipsis break-all overflow-hidden">
            {@html emojify(originalStatus.account.display_name, originalStatus.account.emojis)}</span
          >
          <span class="text-gray-600 text-ellipsis break-all overflow-hidden">@{originalStatus.account.acct}</span>
        </div>
        <div class="date text-gray-600 text-right">
          <time datetime={originalStatus.created_at}>
            {dayjs(originalStatus.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </time>
        </div>
      </div>
      <div class="body text-gray-950 break-all overflow-hidden">
        {@html emojify(originalStatus.content, originalStatus.emojis)}
      </div>
      {#if originalStatus.poll}
        <Poll poll={originalStatus.poll} onRefresh={() => onRefresh(status.id)} {client} />
      {/if}
      {#if originalStatus.card}
        <Card card={originalStatus.card} />
      {/if}
      {#if originalStatus.media_attachments.length > 0}
        <Attachments attachments={originalStatus.media_attachments} />
      {/if}
    </div>
  </div>
</div>

<style>
  .avatar {
    width: 56px;
  }

  .status {
    width: calc(100% - 56px);
  }
</style>
