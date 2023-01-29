<template>
  <div name="list" class="list-timeline">
    <DynamicScroller :items="timeline" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            v-if="account.account && account.server"
            :message="item"
            :focused="item.uri + item.id === focusedId"
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
import { defineComponent, toRefs, ref, computed, onMounted, watch, onBeforeUnmount, onUnmounted, reactive } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { MUTATION_TYPES as CONTENTS_MUTATION } from '@/store/TimelineSpace/Contents'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Lists/Show'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'list',
  props: ['list_id'],
  components: { Toot },
  setup(props) {
    const space = 'TimelineSpace/Contents/Lists/Show'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()
    const { j, k, Ctrl_r } = useMagicKeys()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const { list_id } = toRefs(props)
    const focusedId = ref<string | null>(null)
    const scroller = ref<any>(null)
    const lazyLoading = ref<boolean>(false)
    const heading = ref<boolean>(true)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const timeline = computed(() => store.state.TimelineSpace.Contents.Lists.Show.timeline)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      document.getElementById('scroller')?.addEventListener('scroll', onScroll)
      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      load().finally(() => {
        store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, false)
      })
    })
    watch(list_id, () => {
      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      load().finally(() => {
        store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, false)
      })
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
    whenever(logicAnd(Ctrl_r, shortcutEnabled), () => {
      reload()
    })

    onBeforeUnmount(() => {
      store.dispatch(`${space}/${ACTION_TYPES.STOP_STREAMING}`)
    })
    onUnmounted(() => {
      heading.value = true
      const el = document.getElementById('scroller')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
        el.scrollTop = 0
      }
    })

    const load = async () => {
      await store.dispatch(`${space}/${ACTION_TYPES.STOP_STREAMING}`)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_TIMELINE}`, {
          listID: list_id.value,
          account: account.account,
          server: account.server
        })
      } catch (err) {
        ElMessage({
          message: i18n.t('message.timeline_fetch_error'),
          type: 'error'
        })
      }
      store.dispatch(`${space}/${ACTION_TYPES.START_STREAMING}`, { listID: list_id.value, account: account.account }).catch(() => {
        ElMessage({
          message: i18n.t('message.start_streaming_error'),
          type: 'error'
        })
      })
      return 'started'
    }
    const onScroll = (event: Event) => {
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading
      ) {
        lazyLoading.value = true
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_TIMELINE}`, {
            list_id: list_id.value,
            status: timeline.value[timeline.value.length - 1],
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
      } else if ((event.target as HTMLElement)!.scrollTop <= 10 && !heading.value) {
        heading.value = true
      }
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.STOP_STREAMING}`)
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_TIMELINE}`, list_id.value).catch(() => {
          ElMessage({
            message: i18n.t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
        store.dispatch(`${space}/${ACTION_TYPES.START_STREAMING}`, list_id.value).catch(() => {
          ElMessage({
            message: i18n.t('message.start_streaming_error'),
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
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message.id)
    }
    const upper = () => {
      scroller.value.scrollToItem(0)
      focusedId.value = null
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
      scroller,
      timeline,
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
.list-timeline {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
  }
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
