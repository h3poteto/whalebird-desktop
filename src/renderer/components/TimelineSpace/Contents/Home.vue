<template>
  <div id="home">
    <DynamicScroller :items="filteredTimeline" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template #default="{ item, index, active }">
        <template v-if="item.id === 'loading-card'">
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.id]" :data-index="index" :watchData="true">
            <StatusLoading :since_id="item.since_id" :max_id="item.max_id" :loading="loadingMore" @load_since="fetchTimelineSince" />
          </DynamicScrollerItem>
        </template>
        <template v-else>
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
            <toot
              v-if="account.account && account.server"
              :message="item"
              :focused="item.uri + item.id === focusedId"
              :overlaid="modalOpened"
              :filters="filters"
              :account="account.account"
              :server="account.server"
              v-on:update="updateToot"
              v-on:delete="deleteToot"
              @selectToot="focusToot(item)"
            >
            </toot>
          </DynamicScrollerItem>
        </template>
      </template>
    </DynamicScroller>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUpdate, watch, onUnmounted, reactive } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import StatusLoading from '@/components/organisms/StatusLoading.vue'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Home'
import { MUTATION_TYPES as SIDE_MENU_MUTATION } from '@/store/TimelineSpace/SideMenu'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'home',
  components: { Toot, StatusLoading },
  setup() {
    const space = 'TimelineSpace/Contents/Home'
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
    const showReblogs = ref(true)
    const showReplies = ref(true)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const timeline = computed(() => store.state.TimelineSpace.Contents.Home.timeline[id.value])

    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const filters = computed(() => store.getters[`${space}/filters`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    const shortcutEnabled = computed(() => !modalOpened.value)
    const filteredTimeline = computed(() => {
      if (!timeline.value) {
        return []
      }
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

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_HOME_TIMELINE}`, false)
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)
    })
    onBeforeUpdate(() => {
      if (store.state.TimelineSpace.SideMenu.unreadHomeTimeline && heading.value) {
        store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_HOME_TIMELINE}`, false)
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
      timeline,
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
      }
    })
    whenever(logicAnd(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = timeline.value[0].uri + timeline.value[0].id
      } else {
        focusNext()
      }
    })
    whenever(logicAnd(k, shortcutEnabled), () => {
      focusPrev()
    })

    const onScroll = (event: Event) => {
      // for lazyLoading
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value
      ) {
        lazyLoading.value = true
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_TIMELINE}`, {
            lastStatus: timeline.value[timeline.value.length - 1],
            account: account.account,
            server: account.server
          })
          .catch(() => {
            ElMessage({
              message: i18n.t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
          .finally(() => {
            lazyLoading.value = false
          })
      }

      if ((event.target as HTMLElement)!.scrollTop > 10 && heading.value) {
        heading.value = false
      } else if ((event.target as HTMLElement)!.scrollTop <= 5 && !heading.value) {
        heading.value = true
      }
    }
    const updateToot = (message: Entity.Status) => {
      if (account.account) {
        store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, { status: message, accountId: account.account.id })
      }
    }
    const deleteToot = (message: Entity.Status) => {
      if (account.account) {
        store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, { statusId: message.id, accountId: account.account.id })
      }
    }
    const fetchTimelineSince = (since_id: string) => {
      loadingMore.value = true
      store
        .dispatch(`${space}/${ACTION_TYPES.FETCH_TIMELINE_SINCE}`, { sinceId: since_id, account: account.account, server: account.server })
        .finally(() => {
          setTimeout(() => {
            loadingMore.value = false
          }, 500)
        })
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
      focusToot,
      heading,
      account
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
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
