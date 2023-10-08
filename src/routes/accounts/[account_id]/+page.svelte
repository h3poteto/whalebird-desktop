<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  export let data

  onMount(async () => {
    const lastTimeline = localStorage.getItem(`${data.id}_lastTimeline`)
    if (lastTimeline) {
      goto(`/accounts/${data.id}/timelines/${lastTimeline}`)
    } else {
      goto(`/accounts/${data.id}/timelines/home`)
    }
  })
</script>
