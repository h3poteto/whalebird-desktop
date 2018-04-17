<template>
<transition name="slide-detail">
  <div id="side_bar" v-if="openSideBar">
    <div class="header">
      <i class="el-icon-close" @click="close"></i>
    </div>
    <account-profile v-if="component === 1"></account-profile>
    <toot-detail v-if="component === 2"></toot-detail>
  </div>
</transition>
</template>

<script>
import { mapState } from 'vuex'
import TootDetail from './SideBar/TootDetail'
import AccountProfile from './SideBar/AccountProfile'

export default {
  name: 'side-bar',
  components: {
    TootDetail,
    AccountProfile
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      component: state => state.TimelineSpace.Contents.SideBar.component
    })
  },
  beforeDestroy () {
    this.close()
  },
  methods: {
    close () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/close')
    }
  }
}
</script>

<style lang="scss" scoped>
#side_bar {
  position: fixed;
  top: 48px;
  right: 0;
  width: 320px;
  height: calc(100% - 48px);
  overflow: auto;
  border-left: solid 1px var(--theme-border-color);

  .header {
    background-color: var(--theme-selected-background-color);
    padding: 4px 8px;
    border-top: solid 1px var(--theme-border-color);
    border-bottom: solid 1px var(--theme-border-color);
    text-align: right;

    .el-icon-close {
      cursor: pointer;
    }
  }
}

.slide-detail-enter-active, .slide-detail-leave-active {
  transition: all 0.5s;
}
.slide-detail-enter, .slide-detail-leave-to {
  margin-right: -320px;
  opacity: 0;
}
</style>
