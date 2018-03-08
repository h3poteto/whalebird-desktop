<template>
<div id="timeline_space">
  timeline
</div>
</template>

<script>
export default {
  name: 'timeline-space',
  created () {
    console.log(this.$route.params.id)
  }
}
</script>

<style lang="scss" scoped>
</style>
