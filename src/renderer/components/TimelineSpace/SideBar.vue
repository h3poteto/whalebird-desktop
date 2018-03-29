<template>
<div id="side_bar" v-if="openSideBar">
  <div class="header">
    <i class="el-icon-close" @click="close"></i>
  </div>
  side
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'side-bar',
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.SideBar.openSideBar
    })
  },
  methods: {
    close () {
      this.$store.dispatch('TimelineSpace/SideBar/close')
    }
  }
}
</script>

<style lang="scss" scoped>
#side_bar {
  position: fixed;
  top: 48px;
  right: 0;
  width: 180px;
}
</style>
