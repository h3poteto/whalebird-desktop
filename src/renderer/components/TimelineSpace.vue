<template>
<div id="timeline_space">
  <side-menu></side-menu>
  <div class="content">
    <router-view></router-view>
  </div>
</div>
</template>

<script>
import SideMenu from './TimelineSpace/SideMenu'

export default {
  name: 'timeline-space',
  components: { SideMenu },
  created () {
    this.$store.dispatch('TimelineSpace/fetchAccount', this.$route.params.id)
      .then((account) => {
        this.$store.dispatch('TimelineSpace/fetchHomeTimeline', account)
        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
        this.$store.dispatch('TimelineSpace/username', account)
        this.$store.dispatch('TimelineSpace/fetchNotifications', account)
        this.$store.dispatch('TimelineSpace/watchShortcutEvents', account)
      })
      .catch(() => {
        this.$message({
          message: 'Could not find account',
          type: 'error'
        })
      })
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/stopUserStreaming')
  }
}
</script>

<style lang="scss" scoped>

.content {
  margin-left: 180px;
}
</style>
