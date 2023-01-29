<template>
  <div id="favourites">
    <div style="width: 100%; height: 120px" v-loading="loading" :element-loading-background="backgroundColor" v-if="loading" />
    <DynamicScroller :items="favourites" :min-item-size="60" id="scroller" class="scroller" ref="scroller" v-else>
      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            v-if="account.account && account.server"
            :message="item"
            :focused="item.uri === focusedId"
            :overlaid="modalOpened"
            :filters="[]"
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
import { defineComponent, computed, ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import parse from 'parse-link-header'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'favourites',
  components: { Toot },
  setup() {
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()

    const focusedId = ref<string | null>(null)
    const scroller = ref<any>()
    const { j, k, Ctrl_r } = useMagicKeys()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const loading = ref(false)
    const lazyLoading = ref(false)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)

    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const favourites = ref<Array<Entity.Status>>([])
    const nextMaxId = ref<string | null>(null)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => favourites.value.findIndex(status => focusedId.value === status.uri))
    const shortcutEnabled = computed(() => !modalOpened.value)
    const userAgent = computed(() => store.state.App.userAgent)
    const backgroundColor = computed(() => store.state.App.theme.background_color)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s
      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)

      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      loading.value = true
      try {
        const res = await client.value.getFavourites({ limit: 20 })
        favourites.value = res.data
        const link = parse(res.headers.link)
        if (link !== null && link.next) {
          nextMaxId.value = link.next.max_id
        } else {
          nextMaxId.value = null
        }
      } catch (err) {
        console.error(err)
        ElMessage({
          message: i18n.t('message.favourite_fetch_error'),
          type: 'error'
        })
      } finally {
        loading.value = false
      }
    })

    onUnmounted(() => {
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

    whenever(logicAnd(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = favourites.value[0].uri
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
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value &&
        nextMaxId.value
      ) {
        lazyLoading.value = true
        client.value
          ?.getFavourites({ limit: 20, max_id: nextMaxId.value })
          .then(res => {
            favourites.value = [...favourites.value, ...res.data]
            const link = parse(res.headers.link)
            if (link !== null && link.next) {
              nextMaxId.value = link.next.max_id
            } else {
              nextMaxId.value = null
            }
          })
          .catch(err => {
            console.error(err)
            ElMessage({
              message: i18n.t('message.favourite_fetch_error'),
              type: 'error'
            })
          })
          .finally(() => {
            lazyLoading.value = false
          })
      }
    }
    const updateToot = (message: Entity.Status) => {
      favourites.value = favourites.value.map(status => {
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
      favourites.value = favourites.value.filter(status => {
        if (status.reblog !== null && status.reblog.id === id) {
          return false
        } else {
          return status.id !== id
        }
      })
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        const res = await client.value!.getFavourites({ limit: 20 })
        favourites.value = res.data
        const link = parse(res.headers.link)
        if (link !== null && link.next) {
          nextMaxId.value = link.next.max_id
        } else {
          nextMaxId.value = null
        }
      } finally {
        store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, false)
      }
    }
    const focusNext = () => {
      if (currentFocusedIndex.value === -1) {
        focusedId.value = favourites.value[0].uri
      } else if (currentFocusedIndex.value < favourites.value.length) {
        focusedId.value = favourites.value[currentFocusedIndex.value + 1].uri
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value === 0) {
        focusedId.value = null
      } else if (currentFocusedIndex.value > 0) {
        focusedId.value = favourites.value[currentFocusedIndex.value - 1].uri
      }
    }
    const focusToot = (message: Entity.Status) => {
      focusedId.value = message.id
    }

    return {
      loading,
      favourites,
      backgroundColor,
      scroller,
      focusedId,
      modalOpened,
      updateToot,
      deleteToot,
      focusToot,
      account
    }
  }
})
</script>

<style lang="scss" scoped>
#favourites {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
  }
}
</style>
