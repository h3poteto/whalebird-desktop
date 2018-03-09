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
    console.log(this.$route.params.id)
  }
}
</script>

<style lang="scss" scoped>

.content {
  margin-left: 180px;
}
</style>
