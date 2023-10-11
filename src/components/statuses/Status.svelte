<script lang="ts">
  import { Avatar } from 'flowbite-svelte'
  import type { Entity } from 'megalodon'
  import dayjs from 'dayjs'
  import emojify from '@/components/utils/emojify'

  export let status: Entity.Status
</script>

<div class="flex border-b mr-2 py-1">
  <div class="avatar m-2">
    <Avatar src={status.account.avatar} rounded />
  </div>
  <div class="status">
    <div class="header flex justify-between">
      <div class="account-name flex">
        <span class="text-gray-950">{@html emojify(status.account.display_name, status.account.emojis)}</span>
        <span class="text-gray-600">@{status.account.acct}</span>
      </div>
      <div class="date text-gray-600">
        <time datetime={status.created_at}>
          {dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </time>
      </div>
    </div>
    <div class="body text-gray-950 break-all">
      {@html emojify(status.content, status.emojis)}
    </div>
    {#if status.media_attachments.length > 0}
      <div class="attachments mt-2 flex">
        {#each status.media_attachments as media}
          <img
            src={media.preview_url}
            class="h-36 mr-2 rounded-md max-w-xs cursor-pointer"
            alt={media.description}
            title={media.description}
          />
        {/each}
      </div>
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
