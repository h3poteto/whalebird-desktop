<template>
  <div id="contents">
    <div
      id="scrollable"
      :class="openSideBar ? 'timeline-wrapper-with-side-bar' : 'timeline-wrapper'"
      v-loading="loading"
      :element-loading-text="$t('message.loading')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <router-view></router-view>
    </div>
    <side-bar :overlaid="modalOpened"></side-bar>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SideBar from './Contents/SideBar'

export default {
  name: 'contents',
  components: {
    SideBar
  },
  computed: {
    ...mapState('TimelineSpace/Contents', {
      loading: state => state.loading
    }),
    ...mapState('TimelineSpace/Contents/SideBar', {
      openSideBar: state => state.openSideBar
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened'])
  }
}
</script>

<style lang="scss" scoped>
#contents {
  padding-top: 48px;
  height: 100%;
  box-sizing: border-box;

  .timeline-wrapper {
    height: 100%;
    width: 100%;
    overflow: auto;
    transition: all 0.5s;
    scroll-behavior: auto;
  }

  .timeline-wrapper-with-side-bar {
    height: 100%;
    width: calc(100% - 360px);
    overflow: auto;
    transition: all 0.5s;
    scroll-behavior: auto;
  }
}
</style>
