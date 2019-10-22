<template>
  <div id="contents" ref="contents" :style="customWidth" @mouseup="dragEnd" @mousemove="resize">
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
      <transition name="slide-detail">
        <div>
          <div id="resizer">
            <div class="border"></div>
            <div class="knob" @mousedown="dragStart">
              <icon name="ellipsis-v" class="icon"></icon>
            </div>
          </div>
          <side-bar id="side_bar" :overlaid="modalOpened"></side-bar>
        </div>
      </transition>
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
      sidebarWidth: 360,
      dragging: false
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
      if (this.dragging && event.clientX) {
        this.sidebarWidth = window.innerWidth - event.clientX
      }
    },
    dragStart() {
      this.dragging = true
      this.$refs.contents.style.setProperty('user-select', 'none')
    },
    dragEnd() {
      this.dragging = false
      this.$refs.contents.style.setProperty('user-select', 'text')
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
  user-select: text;

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
    .border {
      width: 1px;
      background-color: var(--theme-border-color);
      height: calc(100% - 48px);
      position: fixed;
      top: 48px;
      right: var(--current-sidebar-width);
    }

    .knob {
      width: 8px;
      background-color: var(--theme-border-color);
      height: 72px;
      position: fixed;
      top: 50%;
      right: calc(var(--current-sidebar-width) - 8px);
      z-index: 1000;
      border-radius: 0 8px 8px 0;
      cursor: col-resize;
      text-align: center;
      vertical-align: middle;
      line-height: 72px;

      .icon {
        display: inline-block;
        color: var(--theme-secondary-color);
      }
    }
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

.slide-detail-enter-active,
.slide-detail-leave-active {
  transition: all 0.5s;
}

.slide-detail-enter,
.slide-detail-leave-to {
  margin-right: -360px;
  opacity: 0;
}
</style>
