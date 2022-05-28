<template>
  <div id="home">
    <div></div>
    <DynamicScroller :items="filteredTimeline" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <template v-if="item.id === 'loading-card'">
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.id]" :data-index="index" :watchData="true">
            <StatusLoading :since_id="item.since_id" :max_id="item.max_id" :loading="loadingMore" @load_since="fetchTimelineSince" />
          </DynamicScrollerItem>
        </template>
        <template v-else>
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
            <toot
              :message="item"
              :focused="item.uri + item.id === focusedId"
              :overlaid="modalOpened"
              :filters="filters"
              v-on:update="updateToot"
              v-on:delete="deleteToot"
              @focusNext="focusNext"
              @focusPrev="focusPrev"
              @focusRight="focusSidebar"
              @selectToot="focusToot(item)"
              @sizeChanged="sizeChanged"
            >
            </toot>
          </DynamicScrollerItem>
        </template>
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
import { defineComponent, ref, computed, onMounted, onBeforeUpdate, onBeforeUnmount, watch, onUnmounted } from 'vue'
import moment from 'moment'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import StatusLoading from '@/components/organisms/StatusLoading.vue'
import { EventEmitter } from '@/components/event'
import { ScrollPosition } from '@/components/utils/scroll'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Home'
import { MUTATION_TYPES as SIDE_MENU_MUTATION } from '@/store/TimelineSpace/SideMenu'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import useReloadable from '@/components/utils/reloadable'

export default defineComponent({
  name: 'home',
  components: { Toot, StatusLoading },
  setup() {
    const space = 'TimelineSpace/Contents/Home'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()
    const { reloadable } = useReloadable(store, route, i18n)

    const focusedId = ref<string | null>(null)
    const scrollPosition = ref<ScrollPosition | null>(null)
    const observer = ref<ResizeObserver | null>(null)
    const scrollTime = ref<moment.Moment | null>(null)
    const resizeTime = ref<moment.Moment | null>(null)
    const loadingMore = ref(false)
    const scroller = ref<any>()

    const timeline = computed(() => store.state.TimelineSpace.Contents.Home.timeline)
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Home.lazyLoading)
    const heading = computed(() => store.state.TimelineSpace.Contents.Home.heading)
    const showReblogs = computed(() => store.state.TimelineSpace.Contents.Home.showReblogs)
    const showReplies = computed(() => store.state.TimelineSpace.Contents.Home.showReplies)
    const scrolling = computed(() => store.state.TimelineSpace.Contents.Home.scrolling)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const filters = computed(() => store.getters[`${space}/filters}`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    // const shortcutEnabled = computed(() => {
    //   if (modalOpened.value) {
    //     return false
    //   }
    //   if (!focusedId.value) {
    //     return true
    //   }
    //   // Sometimes toots are deleted, so perhaps focused toot don't exist.
    //   return currentFocusedIndex.value === -1
    // })
    const filteredTimeline = computed(() => {
      return timeline.value.filter(toot => {
        if ('url' in toot) {
          if (toot.in_reply_to_id) {
            return showReplies.value
          } else if (toot.reblog) {
            return showReblogs.value
          } else {
            return true
          }
        } else {
          return true
        }
      })
    })

    onMounted(() => {
      store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_HOME_TIMELINE}`, false)
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      if (heading.value && timeline.value.length > 0) {
        store.dispatch(`${space}/${ACTION_TYPES.SAVE_MARKER}`)
      }
      const el = document.getElementById('scroller')
      if (el) {
        scrollPosition.value = new ScrollPosition(el)
        scrollPosition.value.prepare()
        observer.value = new ResizeObserver(() => {
          if (loadingMore.value || (scrollPosition.value && !heading.value && !lazyLoading.value && !scrolling.value)) {
            resizeTime.value = moment()
            scrollPosition.value?.restore()
          }
        })
        const scrollWrapper = el.getElementsByClassName('vue-recycle-scroller__item-wrapper')[0]
        observer.value.observe(scrollWrapper)
      }
    })
    onBeforeUpdate(() => {
      if (store.state.TimelineSpace.SideMenu.unreadHomeTimeline && heading.value) {
        store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_HOME_TIMELINE}`, false)
      }
      if (scrollPosition.value) {
        scrollPosition.value.prepare()
      }
    })
    onBeforeUnmount(() => {
      observer.value?.disconnect()
    })
    onUnmounted(() => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      store.commit(`${space}/${MUTATION_TYPES.ARCHIVE_TIMELINE}`)
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

    const onScroll = (event: Event) => {
      if (moment().diff(resizeTime.value) < 500) {
        return
      }
      scrollTime.value = moment()
      if (!scrolling.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, true)
      }

      // for lazyLoading
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
      } else if ((event.target as HTMLElement)!.scrollTop <= 5 && !heading.value) {
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
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
    }
    const deleteToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message.id)
    }
    const fetchTimelineSince = (since_id: string) => {
      loadingMore.value = true
      store.dispatch(`${space}/${ACTION_TYPES.FETCH_TIMELINE_SINCE}`, since_id).finally(() => {
        setTimeout(() => {
          loadingMore.value = false
        }, 500)
      })
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        reloadable()
      } finally {
        store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, false)
      }
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
      filteredTimeline,
      scroller,
      loadingMore,
      fetchTimelineSince,
      focusedId,
      modalOpened,
      filters,
      updateToot,
      deleteToot,
      focusNext,
      focusPrev,
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
#home {
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
    transition: all 0.5s;
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
