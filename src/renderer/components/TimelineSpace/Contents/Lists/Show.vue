<template>
  <div name="list" class="list-timeline">
    <div class="unread">{{ unreads.length > 0 ? unreads.length : '' }}</div>
    <DynamicScroller :items="timeline" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            :message="item"
            :focused="item.uri + item.id === focusedId"
            :overlaid="modalOpened"
            :filters="[]"
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @focusRight="focusSidebar"
            @selectToot="focusToot(item)"
          >
          </toot>
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
import { defineComponent, toRefs, ref, computed, onMounted, watch, onBeforeUnmount, onUnmounted } from 'vue'
import { useMagicKeys, whenever, and } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { EventEmitter } from '@/components/event'
import { MUTATION_TYPES as CONTENTS_MUTATION } from '@/store/TimelineSpace/Contents'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Lists/Show'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'

export default defineComponent({
  name: 'list',
  props: ['list_id'],
  components: { Toot },
  setup(props) {
    const space = 'TimelineSpace/Contents/Lists/Show'
    const store = useStore()
    const i18n = useI18next()
    const { j, k, Ctrl_r } = useMagicKeys()

    const { list_id } = toRefs(props)
    const focusedId = ref<string | null>(null)
    const scroller = ref<any>(null)

    const timeline = computed(() => store.state.TimelineSpace.Contents.Lists.Show.timeline)
    const unreads = computed(() => store.state.TimelineSpace.Contents.Lists.Show.unreads)
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Lists.Show.lazyLoading)
    const heading = computed(() => store.state.TimelineSpace.Contents.Lists.Show.heading)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(() => {
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
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, false)
      } else if (newVal === null && !heading.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      }
    })
    whenever(and(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = timeline.value[0].uri + timeline.value[0].id
      } else {
        focusNext()
      }
    })
    whenever(and(k, shortcutEnabled), () => {
      focusPrev()
    })
    whenever(and(Ctrl_r, shortcutEnabled), () => {
      reload()
    })

    onBeforeUnmount(() => {
      store.dispatch(`${space}/${ACTION_TYPES.STOP_STREAMING}`)
    })
    onUnmounted(() => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      store.commit(`${space}/${MUTATION_TYPES.ARCHIVE_TIMELINE}`)
      store.commit(`${space}/${MUTATION_TYPES.CLEAR_TIMELINE}`)
      const el = document.getElementById('scroller')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
        el.scrollTop = 0
      }
    })

    const load = async () => {
      await store.dispatch(`${space}/${ACTION_TYPES.STOP_STREAMING}`)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_TIMELINE}`, list_id.value)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.timeline_fetch_error'),
          type: 'error'
        })
      }
      store.dispatch(`${space}/${ACTION_TYPES.START_STREAMING}`, list_id.value).catch(() => {
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
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_TIMELINE}`, {
            list_id: list_id.value,
            status: timeline.value[timeline.value.length - 1]
          })
          .catch(() => {
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
        store.commit(`${space}/${MUTATION_TYPES.MERGE_UNREADS}`)
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
    const focusSidebar = () => {
      EventEmitter.emit('focus-sidebar')
    }

    return {
      scroller,
      timeline,
      focusedId,
      modalOpened,
      updateToot,
      deleteToot,
      focusSidebar,
      focusToot,
      openSideBar,
      heading,
      upper,
      unreads
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

  .unread {
    position: fixed;
    right: 24px;
    top: 52px;
    background-color: rgba(0, 0, 0, 0.6);
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 0 0 2px 2px;
    z-index: 1;

    &:empty {
      display: none;
    }
  }
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
