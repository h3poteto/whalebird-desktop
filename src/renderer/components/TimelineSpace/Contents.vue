<template>
  <div id="contents" ref="contents" :style="customWidth" @mouseup="dragEnd" @mousemove="resize">
    <div
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
              <font-awesome-icon icon="ellipsis-vertical" class="icon" />
            </div>
          </div>
          <side-bar id="side_bar" :overlaid="modalOpened"></side-bar>
        </div>
      </transition>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import SideBar from './Contents/SideBar.vue'
import { useStore } from '@/store'

export default defineComponent({
  name: 'contents',
  components: {
    SideBar
  },
  setup() {
    const store = useStore()

    const sidebarWidth = ref<number>(360)
    const dragging = ref<boolean>(false)
    const contents = ref<HTMLElement | null>(null)

    const loading = computed(() => store.state.TimelineSpace.Contents.loading)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const modalOpened = computed(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const customWidth = computed(() => ({ '--current-sidebar-width': `${sidebarWidth.value}px` }))

    const resize = (event: MouseEvent) => {
      if (dragging.value && event.clientX) {
        sidebarWidth.value = window.innerWidth - event.clientX
      }
    }
    const dragStart = () => {
      dragging.value = true
      contents.value?.style.setProperty('user-select', 'none')
    }
    const dragEnd = () => {
      dragging.value = false
      contents.value?.style.setProperty('user-select', 'text')
    }

    return {
      contents,
      customWidth,
      loading,
      openSideBar,
      modalOpened,
      resize,
      dragStart,
      dragEnd
    }
  }
})
</script>

<style lang="scss" scoped>
#contents {
  --current-sidebar-width: 360px;

  padding-top: 53px;
  height: 100%;
  box-sizing: border-box;
  user-select: text;

  .timeline-wrapper {
    height: 100%;
    width: 100%;
  }

  .timeline-wrapper-with-side-bar {
    height: 100%;
    width: calc(100% - var(--current-sidebar-width));
  }

  #resizer {
    .border {
      width: 1px;
      background-color: var(--theme-border-color);
      height: calc(100% - 48px);
      position: fixed;
      top: 53px;
      right: var(--current-sidebar-width);
    }

    .knob {
      width: 8px;
      background-color: var(--theme-border-color);
      height: 72px;
      position: fixed;
      top: 50%;
      right: calc(var(--current-sidebar-width) - 8px);
      z-index: 1;
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
    top: 52px;
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
