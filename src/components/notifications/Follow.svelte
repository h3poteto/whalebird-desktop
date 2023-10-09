<script lang="ts">
  import { Avatar } from 'flowbite-svelte'
  import type { Entity } from 'megalodon'
  import { UserSolid } from 'flowbite-svelte-icons'

  export let notification: Entity.Notification
</script>

{#if notification.account}
  <div class="flex items-center">
    <div class="ml-2">
      <UserSolid class="text-cyan-500 mr-2 ml-auto" strokeWidth="1" size="sm" />
    </div>
    <div class="text-gray-600">{notification.account.username} followed you</div>
  </div>
  <div class="flex">
    <div class="avatar m-2">
      <Avatar src={notification.account.avatar} rounded />
    </div>
    <div class="body">
      <div class="flex">
        <div class="text-gray-800 mr-1">
          {notification.account.display_name}
        </div>
        <div>
          @{notification.account.acct}
        </div>
      </div>
      <div>
        {notification.account.followers_count} followers
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
