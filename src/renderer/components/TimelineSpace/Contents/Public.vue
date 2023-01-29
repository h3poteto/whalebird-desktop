<template>
  <div id="public">
    <div style="width: 100%; height: 120px" v-loading="loading" :element-loading-background="backgroundColor" v-if="loading" />
    <DynamicScroller :items="statuses" :min-item-size="86" id="scroller" class="scroller" ref="scroller" v-else>
      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            v-if="account.account && account.server"
            :message="item"
            :focused="item.uri + item.id === focusedId"
            :overlaid="modalOpened"
            :filters="filters"
            :account="account.account"
            :server="account.server"
            @update="updateToot"
            @delete="deleteToot"
            @select-toot="focusToot(item)"
          >
          </toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUpdate, onMounted, onUnmounted, ref, watch, reactive } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { MUTATION_TYPES as SIDE_MENU_MUTATION } from '@/store/TimelineSpace/SideMenu'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'public',
  components: { Toot },
  setup() {
    const space = 'TimelineSpace/Contents/Public'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()
    const { j, k } = useMagicKeys()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const focusedId = ref<string | null>(null)
    const scroller = ref<any>(null)
    const loading = ref<boolean>(false)
    const lazyLoading = ref(false)
    const heading = ref(true)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)

    const statuses = ref<Array<Entity.Status>>([])
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const filters = computed(() => store.getters[`${space}/filters`])
    const currentFocusedIndex = computed(() => statuses.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    const shortcutEnabled = computed(() => !modalOpened.value)
    const userAgent = computed(() => store.state.App.userAgent)
    const backgroundColor = computed(() => store.state.App.theme.background_color)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s
      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)

      loading.value = true
      try {
        const res = await client.value.getPublicTimeline({ limit: 20 })
        statuses.value = res.data
      } finally {
        loading.value = false
      }

      win.ipcRenderer.removeAllListeners(`update-public-streamings-${a.id}`)
      win.ipcRenderer.on(`update-public-streamings-${a.id}`, (_, update: Entity.Status) => {
        statuses.value = [update, ...statuses.value]
      })
      win.ipcRenderer.removeAllListeners(`delete-public-streamings-${a.id}`)
      win.ipcRenderer.on(`delete-public-streamings-${a.id}`, (_, id: string) => {
        deleteToot(id)
      })

      store.commit(`TimelineSpace/SideMenu/${SIDE_MENU_MUTATION.CHANGE_UNREAD_PUBLIC_TIMELINE}`, false)
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)
    })
    onBeforeUpdate(() => {
      if (store.state.TimelineSpace.SideMenu.unreadPublicTimeline && heading.value) {
        store.commit('TimelineSpace/SideMenu/changeUnreadPublicTimeline', false)
      }
    })
    onUnmounted(() => {
      const el = document.getElementById('scroller')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
        el.scrollTop = 0
      }
    })

    watch(focusedId, (newVal, _oldVal) => {
      if (newVal && heading.value) {
        heading.value = false
      } else if (newVal === null && !heading.value) {
        heading.value = true
      }
    })
    whenever(logicAnd(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = statuses.value[0].uri + statuses.value[0].id
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
        const lastStatus = statuses.value[statuses.value.length - 1]
        lazyLoading.value = true
        client.value
          ?.getPublicTimeline({ max_id: lastStatus.id, limit: 20 })
          .then(res => {
            statuses.value = [...statuses.value, ...res.data]
          })
          .catch(err => {
            console.error(err)
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
      } else if ((event.target as HTMLElement)!.scrollTop <= 10 && !heading.value) {
        heading.value = true
      }
    }

    const updateToot = (message: Entity.Status) => {
      statuses.value = statuses.value.map(status => {
        if (status.id === message.id) {
          return message
        } else if (status.reblog && status.reblog.id === message.id) {
          return Object.assign(status, {
            reblog: message
          })
        }
        return status
      })
    }
    const deleteToot = (id: string) => {
      statuses.value = statuses.value.filter(status => {
        if (status.reblog !== null && status.reblog.id === id) {
          return false
        } else {
          return status.id !== id
        }
      })
    }
    const focusNext = () => {
      if (currentFocusedIndex.value === -1) {
        focusedId.value = statuses.value[0].uri + statuses.value[0].id
      } else if (currentFocusedIndex.value < statuses.value.length) {
        focusedId.value = statuses.value[currentFocusedIndex.value + 1].uri + statuses.value[currentFocusedIndex.value + 1].id
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value === 0) {
        focusedId.value = null
      } else if (currentFocusedIndex.value > 0) {
        focusedId.value = statuses.value[currentFocusedIndex.value - 1].uri + statuses.value[currentFocusedIndex.value - 1].id
      }
    }
    const focusToot = (message: Entity.Status) => {
      focusedId.value = message.uri + message.id
    }

    return {
      loading,
      statuses,
      scroller,
      focusedId,
      modalOpened,
      filters,
      updateToot,
      deleteToot,
      focusToot,
      account,
      backgroundColor
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
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
