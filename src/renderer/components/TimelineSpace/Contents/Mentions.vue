<template>
  <div id="mentions">
    <div></div>
    <DynamicScroller :items="mentions" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.url]" :data-index="index" :watch-data="true">
          <notification
            :message="item"
            :focused="item.id === focusedId"
            :overlaid="modalOpened"
            :filters="[]"
            @update="updateToot"
            @focus-right="focusSidebar"
            @select-notification="focusNotification(item)"
          >
          </notification>
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
import { computed, defineComponent, onBeforeUpdate, onMounted, onUnmounted, ref, watch } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
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
    watch(focusedId, (newVal, _oldVal) => {
      if (newVal && heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, false)
      } else if (newVal === null && !heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      }
    })
    whenever(logicAnd(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = mentions.value[0].id
      } else {
        focusNext()
      }
    })
    whenever(logicAnd(k, shortcutEnabled), () => {
      focusPrev()
    })
    whenever(logicAnd(Ctrl_r, shortcutEnabled), () => {
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
      }
    }
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
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
