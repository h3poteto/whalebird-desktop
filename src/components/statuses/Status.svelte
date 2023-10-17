<script lang="ts">
  import { Avatar } from 'flowbite-svelte'
  import type { Entity } from 'megalodon'
  import dayjs from 'dayjs'
  import emojify from '@/components/utils/emojify'
  import Card from './Card.svelte'
  import Attachments from './Attachments.svelte'

  export let status: Entity.Status
</script>

<div class="flex border-b mr-2 py-1">
  <div class="avatar m-2">
    <Avatar src={status.account.avatar} rounded />
  </div>
  <div class="status relative">
    <div class="header flex justify-between">
      <div class="account-name flex">
        <span class="text-gray-950 text-ellipsis break-all overflow-hidden">
          {@html emojify(status.account.display_name, status.account.emojis)}</span
        >
        <span class="text-gray-600 text-ellipsis break-all overflow-hidden">@{status.account.acct}</span>
      </div>
      <div class="date text-gray-600 text-right">
        <time datetime={status.created_at}>
          {dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </time>
      </div>
    </div>
    <div class="body text-gray-950 break-all overflow-hidden">
      {@html emojify(status.content, status.emojis)}
    </div>
    {#if status.card}
      <Card card={status.card} />
    {/if}
    {#if status.media_attachments.length > 0}
      <Attachments attachments={status.media_attachments} />
    {/if}
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
