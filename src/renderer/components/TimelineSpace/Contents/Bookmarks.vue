<template>
  <div id="bookmarks">
    <div></div>
    <DynamicScroller :items="bookmarks" :min-item-size="60" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
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
import { Entity } from 'megalodon'
import useReloadable from '@/components/utils/reloadable'
import Toot from '@/components/organisms/Toot.vue'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Bookmarks'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'bookmarks',
  components: { Toot },
  setup() {
    const space = 'TimelineSpace/Contents/Bookmarks'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()
    const { reloadable } = useReloadable(store, route, i18n)

    const focusedId = ref<string | null>(null)
    const heading = ref<boolean>(true)
    const scroller = ref<any>()
    const lazyLoading = ref(false)
    const { j, k, Ctrl_r } = useMagicKeys()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const bookmarks = computed(() => store.state.TimelineSpace.Contents.Bookmarks.bookmarks)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => bookmarks.value.findIndex(toot => focusedId.value === toot.uri))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      document.getElementById('scroller')?.addEventListener('scroll', onScroll)
      store.commit(`TimelineSpace/Contents/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      store
        .dispatch(`${space}/${ACTION_TYPES.FETCH_BOOKMARKS}`, account)
        .catch(() => {
          ElMessage({
            message: i18n.t('message.bookmark_fetch_error'),
            type: 'error'
          })
        })
        .finally(() => {
          store.commit(`TimelineSpace/Contents/${TIMELINE_MUTATION.CHANGE_LOADING}`, false)
        })
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
        !lazyLoading.value
      ) {
        lazyLoading.value = true
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_BOOKMARKS}`, account)
          .catch(() => {
            ElMessage({
              message: i18n.t('message.bookmark_fetch_error'),
              type: 'error'
            })
          })
          .finally(() => {
            lazyLoading.value = false
          })
      }
      // for upper
      if ((event.target as HTMLElement)!.scrollTop > 10 && heading.value) {
        heading.value = false
      } else if ((event.target as HTMLElement)!.scrollTop <= 10 && !heading.value) {
        heading.value = true
      }
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        await reloadable()
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_BOOKMARKS}`, account).catch(() => {
          ElMessage({
            message: i18n.t('message.bookmark_fetch_error'),
            type: 'error'
          })
        })
      } finally {
        store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, false)
      }
    }
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
    }
    const deleteToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message)
    }
    const upper = () => {
      scroller.value.scrollToItem(0)
      focusedId.value = null
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
      upper,
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
