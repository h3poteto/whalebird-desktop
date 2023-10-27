<script lang="ts">
  import type { Entity, MegalodonInterface } from 'megalodon'
  import { Avatar } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import dayjs from 'dayjs'
  import emojify from '@/components/utils/emojify'

  export let conversation: Entity.Conversation
  export let client: MegalodonInterface

  $: account = conversation.accounts[0]
</script>

<div class="flex border-b mr-2 py-1">
  <div class="avatar p-2">
    <Avatar src={account.avatar} />
  </div>
  <div class="body">
    <div class="header flex justify-between">
      <div>
        {$_('timeline.conversation.with', { values: { user: account.acct } })}
      </div>
      <div>
        {#if conversation.last_status}
          <time datetime={conversation.last_status.created_at}>
            {dayjs(conversation.last_status.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </time>
        {/if}
      </div>
    </div>
    {#if conversation.last_status}
      <div class="status text-gray-500 break-all overflow-hidden">
        {@html emojify(conversation.last_status.content, conversation.last_status.emojis)}
      </div>
    {/if}
  </div>
</div>

<style>
  .avatar {
    width: 56px;
  }

  .body {
    width: calc(100% - 56px);
  }
</style>
