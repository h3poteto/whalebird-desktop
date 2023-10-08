<script lang="ts">
  import Timeline from './Timeline.svelte'

  export let data
</script>

<Timeline timeline={data.timeline} account={data.account} statuses={data.statuses} client={data.client} />
