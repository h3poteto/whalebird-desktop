<script lang="ts">
  import type { Entity } from 'megalodon'

  export let card: Entity.Card

  const openCard = async () => {
    window.ipcRenderer.invoke('open-browser', card.url)
  }
</script>

<div class="w-full flex border-solid rounded-md border-inherit border overflow-hidden cursor-pointer" on:click={openCard}>
  <div class="h-20 w-20">
    <img src={card.image ?? undefined} alt={card.title} class="h-20 w-20" />
  </div>
  <div class="card px-2 py-2 h-20">
    <p class="text-ellipsis overflow-hidden w-full">
      <strong>{card.title}</strong>
    </p>
    <p class="text-ellipsis overflow-hidden w-full">
      {card.description}
    </p>
  </div>
</div>

<style>
  .card {
    width: calc(100% - 80px);
  }
</style>
