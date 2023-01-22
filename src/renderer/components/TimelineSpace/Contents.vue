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
  height: 100%;
  box-sizing: border-box;
  user-select: text;

  .timeline-wrapper {
    height: 100%;
    width: 100%;
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
