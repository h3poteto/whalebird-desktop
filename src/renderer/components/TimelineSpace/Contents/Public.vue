<template>
  <div id="public">
    <div></div>
    <DynamicScroller :items="timeline" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            :message="item"
            :focused="item.uri + item.id === focusedId"
            :overlaid="modalOpened"
            :filters="filters"
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @focusRight="focusSidebar"
            @selectToot="focusToot(item)"
            @sizeChanged="sizeChanged"
          >
          </toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
      <el-button type="primary" @click="upper" circle>
        <font-awesome-icon icon="angle-up" class="upper-icon" />
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMagicKeys, whenever, and } from '@vueuse/core'
import moment from 'moment'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { EventEmitter } from '@/components/event'
import { ScrollPosition } from '@/components/utils/scroll'
import useReloadable from '@/components/utils/reloadable'
import { MUTATION_TYPES as SIDE_MENU_MUTATION } from '@/store/TimelineSpace/SideMenu'
import { MUTATION_TYPES as TIMELINE_MUTATION, ACTION_TYPES as TIMELINE_ACTION } from '@/store/TimelineSpace'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { MUTATION_TYPES as CONTENTS_MUTATION } from '@/store/TimelineSpace/Contents'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Public'

export default defineComponent({
  name: 'public',
  components: { Toot },
  setup() {
    const space = 'TimelineSpace/Contents/Public'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()
    const { reloadable } = useReloadable(store, route, i18n)
    const { j, k } = useMagicKeys()

    const focusedId = ref<string | null>(null)
    const scrollPosition = ref<ScrollPosition | null>(null)
    const observer = ref<ResizeObserver | null>(null)
    const scrollTime = ref<moment.Moment | null>(null)
    const resizeTime = ref<moment.Moment | null>(null)
    const scroller = ref<any>(null)

    const timeline = computed(() => store.state.TimelineSpace.Contents.Public.timeline)
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Public.lazyLoading)
    const heading = computed(() => store.state.TimelineSpace.Contents.Public.heading)
    const scrolling = computed(() => store.state.TimelineSpace.Contents.Public.scrolling)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const unreadNotification = computed(() => store.state.TimelineSpace.timelineSetting.unreadNotification)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const filters = computed(() => store.getters[`${space}/filters`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(async () => {
      store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_PUBLIC_TIMELINE}`, false)
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)
      if (!unreadNotification.value.public) {
        store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
        await initialize().finally(() => {
          store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, false)
        })
      }

      const el = document.getElementById('scroller')
      if (el) {
        scrollPosition.value = new ScrollPosition(el)
        scrollPosition.value.prepare()

        observer.value = new ResizeObserver(() => {
          if (scrollPosition.value && !heading.value && !lazyLoading.value && !scrolling.value) {
            resizeTime.value = moment()
            scrollPosition.value.restore()
          }
        })

        const scrollWrapper = el.getElementsByClassName('vue-recycle-scroller__item-wrapper')[0]
        observer.value?.observe(scrollWrapper)
      }
    })
    onBeforeUpdate(() => {
      if (store.state.TimelineSpace.SideMenu.unreadPublicTimeline && heading.value) {
        store.commit('TimelineSpace/SideMenu/changeUnreadPublicTimeline', false)
      }
      if (scrollPosition.value) {
        scrollPosition.value.prepare()
      }
    })
    onBeforeUnmount(() => {
      if (!unreadNotification.value.public) {
        store.dispatch(`TimelineSpace/${TIMELINE_ACTION.STOP_PUBLIC_STREAMING}`)
        store.dispatch(`TimelineSpace/${TIMELINE_ACTION.UNBIND_PUBLIC_STREAMING}`)
      }
      EventEmitter.off('focus-timeline')
      observer.value?.disconnect()
    })
    onUnmounted(() => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      store.commit(`${space}/${MUTATION_TYPES.ARCHIVE_TIMELINE}`)
      if (!unreadNotification.value.public) {
        store.commit(`${space}/${MUTATION_TYPES.CLEAR_TIMELINE}`)
      }
      const el = document.getElementById('scroller')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
        el.scrollTop = 0
      }
    })
    watch(startReload, (newVal, oldVal) => {
      if (!oldVal && newVal) {
        reload().finally(() => {
          store.commit(`TimelineSpace/HeaderMenu/${HEADER_MUTATION.CHANGE_RELOAD}`, false)
        })
      }
    })

    watch(focusedId, (newVal, _oldVal) => {
      if (newVal && heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, false)
      } else if (newVal === null && !heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      }
    })
    whenever(and(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = timeline.value[0].uri + timeline.value[0].id
      } else {
        focusNext()
      }
    })
    whenever(and(k, shortcutEnabled), () => {
      focusPrev()
    })

    const initialize = async () => {
      await store.dispatch(`${space}/${ACTION_TYPES.FETCH_PUBLIC_TIMELINE}`).catch(_ => {
        ElMessage({
          message: i18n.t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
      await store.dispatch(`TimelineSpace/${TIMELINE_ACTION.BIND_PUBLIC_STREAMING}`)
      store.dispatch(`TimelineSpace/${TIMELINE_ACTION.START_PUBLIC_STREAMING}`)
    }
    const onScroll = (event: Event) => {
      if (moment().diff(resizeTime.value) < 500) {
        return
      }

      scrollTime.value = moment()
      if (!scrolling.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, true)
      }

      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value
      ) {
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_TIMELINE}`, timeline.value[timeline.value.length - 1])
          .then(statuses => {
            if (statuses === null) {
              return
            }
            if (statuses.length > 0) {
              store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, true)
              setTimeout(() => {
                store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, false)
              }, 500)
            }
          })
          .catch(() => {
            ElMessage({
              message: i18n.t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }

      if ((event.target as HTMLElement)!.scrollTop > 10 && heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, false)
      } else if ((event.target as HTMLElement)!.scrollTop <= 10 && !heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      }

      setTimeout(() => {
        const now = moment()
        if (now.diff(scrollTime.value) >= 150) {
          scrollTime.value = null
          store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, false)
        }
      }, 150)
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        await reloadable()
      } finally {
        store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, false)
      }
    }
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
    }
    const deleteToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message.id)
    }
    const upper = () => {
      scroller.value.scrollToItem(0)
      focusedId.value = null
    }
    const focusNext = () => {
      if (currentFocusedIndex.value === -1) {
        focusedId.value = timeline.value[0].uri + timeline.value[0].id
      } else if (currentFocusedIndex.value < timeline.value.length) {
        focusedId.value = timeline.value[currentFocusedIndex.value + 1].uri + timeline.value[currentFocusedIndex.value + 1].id
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value === 0) {
        focusedId.value = null
      } else if (currentFocusedIndex.value > 0) {
        focusedId.value = timeline.value[currentFocusedIndex.value - 1].uri + timeline.value[currentFocusedIndex.value - 1].id
      }
    }
    const focusToot = (message: Entity.Status) => {
      focusedId.value = message.uri + message.id
    }
    const focusSidebar = () => {
      EventEmitter.emit('focus-sidebar')
    }
    const sizeChanged = () => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, true)
      setTimeout(() => {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, false)
      }, 500)
    }

    return {
      timeline,
      scroller,
      focusedId,
      modalOpened,
      filters,
      updateToot,
      deleteToot,
      focusSidebar,
      focusToot,
      sizeChanged,
      openSideBar,
      heading,
      upper
    }
  }
})
</script>

<style lang="scss" scoped>
#public {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
  }

  .loading-card {
    height: 60px;
  }

  .loading-card:empty {
    height: 0;
  }

  .upper {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }

  .upper-with-side-bar {
    position: fixed;
    bottom: 20px;
    right: calc(20px + var(--current-sidebar-width));
    transition: all 0.5s;
  }

  .upper-icon {
    padding: 3px;
  }
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
