<template>
  <div id="contents" :style="customWidth">
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
    <template v-if="openSideBar">
      <div id="resizer" ref="sidebarResizer" draggable="true" @drag="resize"></div>
      <side-bar id="side_bar" :overlaid="modalOpened"></side-bar>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import SideBar from './Contents/SideBar'

export default {
  name: 'contents',
  data() {
    return {
      sidebarWidth: 360
    }
  },
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
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
    customWidth: function() {
      return {
        '--current-sidebar-width': `${this.sidebarWidth}px`
      }
    }
  },
  methods: {
    resize(event) {
      if (event.clientX) {
        this.sidebarWidth = window.innerWidth - event.clientX
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#contents {
  --current-sidebar-width: 360px;

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
    width: calc(100% - var(--current-sidebar-width));
    overflow: auto;
    transition: all 0.5s;
    scroll-behavior: auto;
  }

  #resizer {
    width: 8px;
    background-color: var(--theme-border-color);
    height: 72px;
    position: fixed;
    top: 50%;
    right: calc(var(--current-sidebar-width) - 8px);
    z-index: 1000;
    border-radius: 0 8px 8px 0;
    cursor: col-resize;
  }

  #side_bar {
    position: fixed;
    top: 48px;
    right: 0;
    width: var(--current-sidebar-width);
    height: calc(100% - 48px);
    border-left: solid 1px var(--theme-border-color);
  }
}
</style>
