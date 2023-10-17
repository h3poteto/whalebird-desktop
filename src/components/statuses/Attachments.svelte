<script lang="ts">
  import type { Entity } from 'megalodon'

  export let attachments: Array<Entity.Attachment> = []
</script>

<div class="attachments mt-2 flex flex-wrap">
  {#each attachments as media}
    <img
      src={media.preview_url}
      class="h-36 mr-2 mb-2 rounded-md max-w-full cursor-pointer"
      alt={media.description}
      title={media.description}
    />
  {/each}
</div>
