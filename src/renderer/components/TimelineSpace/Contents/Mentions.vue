<template>
  <div id="mentions">
    <div></div>
    <DynamicScroller :items="mentions" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <template v-if="item.id === 'loading-card'">
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.id]" :data-index="index" :watchData="true">
            <StatusLoading :since_id="item.since_id" :max_id="item.max_id" :loading="loadingMore" @load_since="fetchMentionsSince" />
          </DynamicScrollerItem>
        </template>
        <template v-else>
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.url]" :data-index="index" :watchData="true">
            <notification
              :message="item"
              :focused="item.id === focusedId"
              :overlaid="modalOpened"
              :filters="[]"
              v-on:update="updateToot"
              @focusNext="focusNext"
              @focusPrev="focusPrev"
              @focusRight="focusSidebar"
              @selectNotification="focusNotification(item)"
              @sizeChanged="sizeChanged"
            >
            </notification>
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
import { computed, defineComponent, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, ref, watch } from 'vue'
import moment from 'moment'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { Entity } from 'megalodon'
import { ElMessage } from 'element-plus'
import { useStore } from '@/store'
import Notification from '@/components/organisms/Notification.vue'
import StatusLoading from '@/components/organisms/StatusLoading.vue'
import { EventEmitter } from '@/components/event'
import { ScrollPosition } from '@/components/utils/scroll'
import useReloadable from '@/components/utils/reloadable'
import { LoadingCard } from '@/types/loading-card'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Mentions'
import { MUTATION_TYPES as SIDE_MENU_MUTATION } from '@/store/TimelineSpace/SideMenu'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'

export default defineComponent({
  name: 'mentions',
  components: { Notification, StatusLoading },
  setup() {
    const space = 'TimelineSpace/Contents/Mentions'
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

    const mentions = computed<Array<Entity.Notification | LoadingCard>>(() => store.getters[`${space}/mentions`])
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Mentions.lazyLoading)
    const heading = computed(() => store.state.TimelineSpace.Contents.Mentions.heading)
    const scrolling = computed(() => store.state.TimelineSpace.Contents.Mentions.scrolling)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => mentions.value.findIndex(notification => focusedId.value === notification.id))
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

    onMounted(() => {
      store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_HOME_TIMELINE}`, false)
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      if (heading.value && mentions.value.length > 0) {
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
      if (store.state.TimelineSpace.SideMenu.unreadMentions && heading.value) {
        store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_MENTIONS}`, false)
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
      store.commit(`${space}/${MUTATION_TYPES.ARCHIVE_MENTIONS}`)
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
    watch(
      mentions,
      (newVal, _oldVal) => {
        if (heading.value && newVal.length > 0) {
          store.dispatch(`${space}/${ACTION_TYPES.SAVE_MARKER}`)
        }
      },
      { deep: true }
    )

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
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_MENTIONS}`, mentions.value[mentions.value.length - 1])
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
        store.dispatch(`${space}/${ACTION_TYPES.SAVE_MARKER}`)
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
    const fetchMentionsSince = (since_id: string) => {
      loadingMore.value = true
      store.dispatch(`${space}/${ACTION_TYPES.FETCH_MENTIONS_SINCE}`, since_id).finally(() => {
        setTimeout(() => {
          loadingMore.value = false
        }, 500)
      })
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        await reloadable()
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
        focusedId.value = mentions.value[0].id
      } else if (currentFocusedIndex.value < mentions.value.length) {
        focusedId.value = mentions.value[currentFocusedIndex.value + 1].id
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value === 0) {
        focusedId.value = null
      } else if (currentFocusedIndex.value > 0) {
        focusedId.value = mentions.value[currentFocusedIndex.value - 1].id
      }
    }
    const focusNotification = (message: Entity.Notification) => {
      focusedId.value = message.id
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
      mentions,
      scroller,
      loadingMore,
      fetchMentionsSince,
      focusedId,
      modalOpened,
      updateToot,
      focusNext,
      focusPrev,
      focusSidebar,
      focusNotification,
      sizeChanged,
      openSideBar,
      heading,
      upper
    }
  }
})
</script>

<style lang="scss" scoped>
#mentions {
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
