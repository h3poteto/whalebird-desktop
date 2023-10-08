<script lang="ts">
  import { Avatar } from 'flowbite-svelte'
  import type { Entity } from 'megalodon'

  export let status: Entity.Status
</script>

<div class="flex">
  <div class="avatar m-2">
    <Avatar src={status.account.avatar} rounded />
  </div>
  <div class="status">
    <div class="name">
      <span class="text-gray-950">{status.account.display_name}</span>
      <span class="text-gray-600">@{status.account.acct}</span>
    </div>
    <div class="body text-gray-950">
      {@html status.content}
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
