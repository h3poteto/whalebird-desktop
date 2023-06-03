<template>
  <div name="tag" class="tag-timeline">
    <div style="width: 100%; height: 120px" v-loading="loading" :element-loading-background="backgroundColor" v-if="loading" />
    <DynamicScroller :items="statuses" :min-item-size="86" id="scroller" class="scroller" ref="scroller" v-else>
      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            v-if="account.account && account.server"
            :message="item"
            :focused="item.uri + item.id === focusedId"
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
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, toRefs, watch, reactive } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever, useActiveElement } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { useTranslation } from 'i18next-vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'tag',
  components: { Toot },
  props: ['tag'],
  setup(props) {
    const store = useStore()
    const route = useRoute()
    const { t } = useTranslation()
    const { j, k, Ctrl_r, Cmd_r } = useMagicKeys()
    const activeElement = useActiveElement()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const { tag } = toRefs(props)
    const focusedId = ref<string | null>(null)
    const scroller = ref<any>(null)
    const lazyLoading = ref(false)
    const loading = ref(false)
    const heading = ref(true)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)

    const statuses = ref<Array<Entity.Status>>([])
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => statuses.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    const shortcutEnabled = computed(
      () => activeElement.value?.tagName !== 'INPUT' && activeElement.value?.tagName !== 'TEXTAREA' && !modalOpened.value
    )
    const userAgent = computed(() => store.state.App.userAgent)
    const backgroundColor = computed(() => store.state.App.theme.background_color)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s
      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)

      loading.value = true
      load(tag.value).finally(() => {
        loading.value = false
      })
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)
    })
    watch(tag, (newTag, _oldTag) => {
      loading.value = true
      reset()
      load(newTag).finally(() => {
        loading.value = false
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
        focusedId.value = statuses.value[0].uri + statuses.value[0].id
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
    whenever(logicAnd(Cmd_r, shortcutEnabled), () => {
      reload()
    })

    onBeforeUnmount(() => {
      reset()
    })

    const load = async (tag: string) => {
      if (!client.value) return
      try {
        const res = await client.value.getTagTimeline(tag, { limit: 20 })
        statuses.value = res.data
      } catch (err) {
        console.error(err)
        ElMessage({
          message: t('message.timeline_fetch_error'),
          type: 'error'
        })
      }
      if (!account.account) return
      win.ipcRenderer.on(`update-tag-streamings-${account.account.id}`, (_, update: Entity.Status) => {
        statuses.value = [update, ...statuses.value]
      })
      win.ipcRenderer.on(`delete-tag-streamings-${account.account.id}`, (_, id: string) => {
        deleteToot(id)
      })
      win.ipcRenderer.send('start-tag-streaming', {
        tag: encodeURIComponent(tag),
        accountId: account.account.id
      })
    }
    const reset = () => {
      heading.value = true
      const el = document.getElementById('scroller')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
        el.scrollTop = 0
      }
    }
    const onScroll = (event: Event) => {
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value
      ) {
        const lastStatus = statuses.value[statuses.value.length - 1]
        lazyLoading.value = true
        client.value
          ?.getTagTimeline(tag.value, { max_id: lastStatus.id, limit: 20 })
          .then(res => {
            statuses.value = [...statuses.value, ...res.data]
          })
          .catch(() => {
            ElMessage({
              message: t('message.timeline_fetch_error'),
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
    const reload = async () => {
      loading.value = true
      try {
        await load(tag.value)
      } finally {
        loading.value = false
      }
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
      statuses,
      scroller,
      focusedId,
      updateToot,
      deleteToot,
      focusToot,
      heading,
      account,
      loading,
      backgroundColor
    }
  }
})
</script>

<style lang="scss" scoped>
.tag-timeline {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
  }
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
