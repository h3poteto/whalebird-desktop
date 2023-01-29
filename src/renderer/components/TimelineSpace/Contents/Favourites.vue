<template>
  <div id="favourites">
    <div></div>
    <DynamicScroller :items="favourites" :min-item-size="60" id="scroller" class="scroller" ref="scroller">
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
import { Entity } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Favourites'
import { MUTATION_TYPES as CONTENTS_MUTATION } from '@/store/TimelineSpace/Contents'
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
    const space = 'TimelineSpace/Contents/Favourites'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()

    const heading = ref<boolean>(false)
    const focusedId = ref<string | null>(null)
    const scroller = ref<any>()
    const { j, k, Ctrl_r } = useMagicKeys()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const lazyLoading = ref(false)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const favourites = computed(() => store.state.TimelineSpace.Contents.Favourites.favourites)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => favourites.value.findIndex(status => focusedId.value === status.uri))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      store
        .dispatch(`${space}/${ACTION_TYPES.FETCH_FAVOURITES}`, account)
        .catch(() => {
          ElMessage({
            message: i18n.t('message.favourite_fetch_error'),
            type: 'error'
          })
        })
        .finally(() => {
          store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, false)
        })
    })

    onUnmounted(() => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_FAVOURITES}`, [])
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
        !lazyLoading.value
      ) {
        lazyLoading.value = true
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_FAVOURITES}`, account)
          .catch(() => {
            ElMessage({
              message: i18n.t('message.favourite_fetch_error'),
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
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
    }
    const deleteToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message)
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_FAVOURITES}`, account).catch(() => {
          ElMessage({
            message: i18n.t('message.favourite_fetch_error'),
            type: 'error'
          })
        })
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
      favourites,
      scroller,
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
#favourites {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
  }
}
</style>
