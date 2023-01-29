<template>
  <div id="bookmarks">
    <div></div>
    <DynamicScroller :items="bookmarks" :min-item-size="60" id="scroller" class="scroller" ref="scroller">
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
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @selectToot="focusToot(item)"
          ></toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, reactive } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import parse from 'parse-link-header'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'bookmarks',
  components: { Toot },
  setup() {
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()

    const focusedId = ref<string | null>(null)
    const heading = ref<boolean>(true)
    const scroller = ref<any>()
    const loading = ref(false)
    const lazyLoading = ref(false)
    const { j, k, Ctrl_r } = useMagicKeys()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)

    const bookmarks = ref<Array<Entity.Status>>([])
    const nextMaxId = ref<string | null>(null)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => bookmarks.value.findIndex(toot => focusedId.value === toot.uri))
    const shortcutEnabled = computed(() => !modalOpened.value)
    const userAgent = computed(() => store.state.App.userAgent)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      loading.value = true
      try {
        const res = await client.value.getBookmarks({ limit: 20 })
        bookmarks.value = res.data
        const link = parse(res.headers.link)
        if (link !== null && link.next) {
          nextMaxId.value = link.next.max_id
        } else {
          nextMaxId.value = null
        }
      } catch (err) {
        console.error(err)
        ElMessage({
          message: i18n.t('message.bookmark_fetch_error'),
          type: 'error'
        })
      } finally {
        loading.value = false
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
        focusedId.value = bookmarks.value[0].uri
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
          ?.getBookmarks({ limit: 20, max_id: nextMaxId.value })
          .then(res => {
            bookmarks.value = [...bookmarks.value, ...res.data]
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
              message: i18n.t('message.bookmark_fetch_error'),
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
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      if (!client.value) return
      try {
        const res = await client.value.getBookmarks({ limit: 20 })
        bookmarks.value = res.data
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
    const updateToot = (message: Entity.Status) => {
      bookmarks.value = bookmarks.value.map(status => {
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
      bookmarks.value = bookmarks.value.filter(status => {
        if (status.reblog !== null && status.reblog.id === id) {
          return false
        } else {
          return status.id !== id
        }
      })
    }
    const focusNext = () => {
      if (currentFocusedIndex.value === -1) {
        focusedId.value = bookmarks.value[0].uri
      } else if (currentFocusedIndex.value < bookmarks.value.length) {
        focusedId.value = bookmarks.value[currentFocusedIndex.value + 1].uri
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value === 0) {
        focusedId.value = null
      } else if (currentFocusedIndex.value > 0) {
        focusedId.value = bookmarks.value[currentFocusedIndex.value - 1].uri
      }
    }
    const focusToot = (message: Entity.Status) => {
      focusedId.value = message.id
    }

    return {
      scroller,
      bookmarks,
      focusedId,
      modalOpened,
      updateToot,
      deleteToot,
      focusToot,
      heading,
      account
    }
  }
})
</script>

<style lang="scss" scoped>
#bookmarks {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
  }
}
</style>
