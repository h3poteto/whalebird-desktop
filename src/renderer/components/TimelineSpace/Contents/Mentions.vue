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
              @focusRight="focusSidebar"
              @selectNotification="focusNotification(item)"
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
import { useMagicKeys, whenever, and } from '@vueuse/core'
import moment from 'moment'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { Entity } from 'megalodon'
import { ElMessage } from 'element-plus'
import { useStore } from '@/store'
import Notification from '@/components/organisms/Notification.vue'
import StatusLoading from '@/components/organisms/StatusLoading.vue'
import { EventEmitter } from '@/components/event'
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
    const { j, k, Ctrl_r } = useMagicKeys()

    const focusedId = ref<string | null>(null)
    const loadingMore = ref(false)
    const scroller = ref<any>()

    const mentions = computed<Array<Entity.Notification | LoadingCard>>(() => store.getters[`${space}/mentions`])
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Mentions.lazyLoading)
    const heading = computed(() => store.state.TimelineSpace.Contents.Mentions.heading)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => mentions.value.findIndex(notification => focusedId.value === notification.id))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(() => {
      store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_MENTIONS}`, false)
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      if (heading.value && mentions.value.length > 0) {
        store.dispatch(`${space}/${ACTION_TYPES.SAVE_MARKER}`)
      }
    })
    onBeforeUpdate(() => {
      if (store.state.TimelineSpace.SideMenu.unreadMentions && heading.value) {
        store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_MENTIONS}`, false)
      }
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
    watch(focusedId, (newVal, _oldVal) => {
      if (newVal && heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, false)
      } else if (newVal === null && !heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      }
    })
    whenever(and(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = mentions.value[0].id
      } else {
        focusNext()
      }
    })
    whenever(and(k, shortcutEnabled), () => {
      focusPrev()
    })
    whenever(and(Ctrl_r, shortcutEnabled), () => {
      reload()
    })

    const onScroll = (event: Event) => {
      // for lazyLoading
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value
      ) {
        store.dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_MENTIONS}`, mentions.value[mentions.value.length - 1]).catch(() => {
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

    return {
      mentions,
      scroller,
      loadingMore,
      fetchMentionsSince,
      focusedId,
      modalOpened,
      updateToot,
      focusSidebar,
      focusNotification,
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
