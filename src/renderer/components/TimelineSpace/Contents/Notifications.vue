<template>
  <div id="notifications">
    <DynamicScroller :items="notifications" :min-item-size="20" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <template v-if="item.id === 'loading-card'">
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.id]" :data-index="index" :watchData="true">
            <StatusLoading :since_id="item.since_id" :max_id="item.max_id" :loading="loadingMore" @load_since="fetchNotificationsSince" />
          </DynamicScrollerItem>
        </template>
        <template v-else>
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.url]" :data-index="index" :watchData="true">
            <notification
              v-if="account.account && account.server"
              :message="item"
              :focused="item.id === focusedId"
              :overlaid="modalOpened"
              :filters="filters"
              :account="account.account"
              :server="account.server"
              v-on:update="updateToot"
              @selectNotification="focusNotification(item)"
            >
            </notification>
          </DynamicScrollerItem>
        </template>
      </template>
    </DynamicScroller>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUpdate, onUnmounted, watch, reactive } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import Notification from '@/components/organisms/Notification.vue'
import StatusLoading from '@/components/organisms/StatusLoading.vue'
import { useStore } from '@/store'
import { useRoute } from 'vue-router'
import { useI18next } from 'vue3-i18next'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Notifications'
import { MUTATION_TYPES as SIDE_MENU_MUTATION } from '@/store/TimelineSpace/SideMenu'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'notifications',
  components: { Notification, StatusLoading },

  setup() {
    const space = 'TimelineSpace/Contents/Notifications'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()
    const { j, k } = useMagicKeys()

    const win = (window as any) as MyWindow

    const id = computed(() => parseInt(route.params.id as string))

    const focusedId = ref<string | null>(null)
    const loadingMore = ref(false)
    const scroller = ref<any>()
    const lazyLoading = ref(false)
    const heading = ref(true)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const notifications = computed(() => store.state.TimelineSpace.Contents.Notifications.notifications[id.value])
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const filters = computed(() => store.getters[`${space}/filters}`])
    const currentFocusedIndex = computed(() => notifications.value.findIndex(notification => focusedId.value === notification.id))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_NOTIFICATIONS}`, false)
      store.dispatch(`${space}/${ACTION_TYPES.RESET_BADGE}`)
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      if (heading.value && notifications.value.length > 0) {
        store.dispatch(`${space}/${ACTION_TYPES.SAVE_MARKER}`, account)
      }
    })
    onBeforeUpdate(() => {
      if (store.state.TimelineSpace.SideMenu.unreadNotifications && heading.value) {
        store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_NOTIFICATIONS}`, false)
      }
    })
    onUnmounted(() => {
      const el = document.getElementById('scroller')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
        el.scrollTop = 0
      }
    })
    watch(
      notifications,
      (newState, _oldState) => {
        if (heading.value && newState.length > 0 && account.account && account.server) {
          store.dispatch(`${space}/${ACTION_TYPES.SAVE_MARKER}`, account)
        }
      },
      { deep: true }
    )
    watch(focusedId, (newVal, _oldVal) => {
      if (newVal && heading.value) {
        heading.value = false
      } else if (newVal === null && !heading.value) {
        heading.value = true
        store.commit(`${space}/${ACTION_TYPES.RESET_BADGE}`)
      }
    })
    whenever(logicAnd(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = notifications.value[0].id
      } else {
        focusNext()
      }
    })
    whenever(logicAnd(k, shortcutEnabled), () => {
      focusPrev()
    })

    const onScroll = (event: Event) => {
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value
      ) {
        lazyLoading.value = true
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_NOTIFICATIONS}`, {
            lastNotification: notifications.value[notifications.value.length - 1],
            account: account.account,
            server: account.server
          })
          .catch(() => {
            ElMessage({
              message: i18n.t('message.notification_fetch_error'),
              type: 'error'
            })
          })
          .finally(() => {
            lazyLoading.value = false
          })
      }

      if ((event.target as HTMLElement)!.scrollTop > 10 && heading.value) {
        heading.value = false
      } else if ((event.target as HTMLElement)!.scrollTop <= 10 && !heading.value) {
        heading.value = true
        store.dispatch(`${space}/${ACTION_TYPES.RESET_BADGE}`)
        store.dispatch(`${space}/${ACTION_TYPES.SAVE_MARKER}`, account)
      }
    }
    const updateToot = (message: Entity.Status) => {
      if (account.account) {
        store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, { status: message, accountId: account.account.id })
      }
    }
    const fetchNotificationsSince = (since_id: string) => {
      loadingMore.value = true
      store
        .dispatch(`${space}/${ACTION_TYPES.FETCH_NOTIFICATIONS_SINCE}`, {
          sinceId: since_id,
          account: account.account,
          server: account.server
        })
        .finally(() => {
          setTimeout(() => {
            loadingMore.value = false
          }, 500)
        })
    }
    const upper = () => {
      scroller.value.scrollToItem(0)
      focusedId.value = null
    }
    const focusNext = () => {
      if (currentFocusedIndex.value === -1) {
        focusedId.value = notifications.value[0].id
      } else if (currentFocusedIndex.value < notifications.value.length) {
        focusedId.value = notifications.value[currentFocusedIndex.value + 1].id
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value === 0) {
        focusedId.value = null
      } else if (currentFocusedIndex.value > 0) {
        focusedId.value = notifications.value[currentFocusedIndex.value - 1].id
      }
    }
    const focusNotification = (notification: Entity.Notification) => {
      focusedId.value = notification.id
    }

    return {
      notifications,
      loadingMore,
      fetchNotificationsSince,
      focusedId,
      modalOpened,
      filters,
      updateToot,
      focusNext,
      focusPrev,
      focusNotification,
      heading,
      upper,
      account
    }
  }
})
</script>

<style lang="scss" scoped>
#notifications {
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
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
