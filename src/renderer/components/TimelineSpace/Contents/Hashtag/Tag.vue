<template>
  <div name="tag" class="tag-timeline">
    <div></div>
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
            @focusNext="focusNext"
            @focusPrev="focusPrev"
            @focusRight="focusSidebar"
            @selectToot="focusToot(item)"
            @sizeChanged="sizeChanged"
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
import { computed, defineComponent, onBeforeUnmount, onBeforeUpdate, onMounted, ref, toRefs, watch } from 'vue'
import moment from 'moment'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { EventEmitter } from '@/components/event'
import { ScrollPosition } from '@/components/utils/scroll'
import useReloadable from '@/components/utils/reloadable'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { MUTATION_TYPES as CONTENTS_MUTATION } from '@/store/TimelineSpace/Contents'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Hashtag/Tag'

export default defineComponent({
  name: 'tag',
  components: { Toot },
  props: ['tag'],
  setup(props) {
    const space = 'TimelineSpace/Contents/Hashtag/Tag'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()
    const { reloadable } = useReloadable(store, route, i18n)

    const { tag } = toRefs(props)
    const focusedId = ref<string | null>(null)
    const scrollPosition = ref<ScrollPosition | null>(null)
    const observer = ref<ResizeObserver | null>(null)
    const scrollTime = ref<moment.Moment | null>(null)
    const resizeTime = ref<moment.Moment | null>(null)
    const scroller = ref<any>(null)

    const timeline = computed(() => store.state.TimelineSpace.Contents.Hashtag.Tag.timeline)
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Hashtag.Tag.lazyLoading)
    const heading = computed(() => store.state.TimelineSpace.Contents.Hashtag.Tag.heading)
    const scrolling = computed(() => store.state.TimelineSpace.Contents.Hashtag.Tag.scrolling)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const modalOpened = computed(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))

    onMounted(() => {
      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      load(tag.value).finally(() => {
        store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, false)
      })
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      const el = document.getElementById('scroller')
      if (el) {
        scrollPosition.value = new ScrollPosition(el)
        scrollPosition.value.prepare()

        observer.value = new ResizeObserver(() => {
          if (scrollPosition.value && !heading.value && !lazyLoading.value && !scrolling.value) {
            resizeTime.value = moment()
            scrollPosition.value.restore()
          }
        })

        const scrollWrapper = el.getElementsByClassName('vue-recycle-scroller__item-wrapper')[0]
        observer.value.observe(scrollWrapper)
      }
    })
    onBeforeUpdate(() => {
      if (scrollPosition.value) {
        scrollPosition.value?.prepare()
      }
    })
    watch(tag, (newTag, _oldTag) => {
      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      reset()
      load(newTag).finally(() => {
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
    onBeforeUnmount(() => {
      store.dispatch(`${space}/${ACTION_TYPES.STOP_STREAMING}`)
      reset()
      EventEmitter.off('focus-timeline')
      observer.value?.disconnect()
    })

    const load = async (tag: string) => {
      await store.dispatch(`${space}/${ACTION_TYPES.FETCH}`, tag).catch(() => {
        ElMessage({
          message: i18n.t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
      store.dispatch(`${space}/${ACTION_TYPES.START_STREAMING}`, tag).catch(() => {
        ElMessage({
          message: i18n.t('message.start_streaming_error'),
          type: 'error'
        })
      })
      return true
    }
    const reset = () => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_HEADING}`, true)
      store.commit(`${space}/${MUTATION_TYPES.ARCHIVE_TIMELINE}`)
      store.commit(`${space}/${MUTATION_TYPES.CLEAR_TIMELINE}`)
      const el = document.getElementById('scroller')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
        el.scrollTop = 0
      }
    }
    const onScroll = (event: Event) => {
      if (moment().diff(resizeTime.value) < 500) {
        return
      }
      scrollTime.value = moment()
      if (!scrolling.value) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, true)
      }

      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value
      ) {
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_TIMELINE}`, {
            tag: tag.value,
            status: timeline.value[timeline.value.length - 1]
          })
          .then(statuses => {
            if (statuses === null) {
              return
            }
            if (statuses.length > 0) {
              store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, true)
              setTimeout(() => {
                store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, false)
              }, 500)
            }
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
      }

      setTimeout(() => {
        const now = moment()
        if (now.diff(scrollTime.value) >= 150) {
          scrollTime.value = null
          store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, false)
        }
      }, 150)
    }
    const updateToot = (toot: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, toot)
    }
    const deleteToot = (toot: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, toot.id)
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        await reloadable()
        await store.dispatch(`${space}/${ACTION_TYPES.STOP_STREAMING}`)
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH}`, tag.value).catch(() => {
          ElMessage({
            message: i18n.t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
        store.dispatch(`${space}/${ACTION_TYPES.START_STREAMING}`, tag.value).catch(() => {
          ElMessage({
            message: i18n.t('message.start_streaming_error'),
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
    const sizeChanged = () => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, true)
      setTimeout(() => {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_SCROLLING}`, false)
      }, 500)
    }

    return {
      timeline,
      scroller,
      focusedId,
      modalOpened,
      updateToot,
      deleteToot,
      focusNext,
      focusPrev,
      focusSidebar,
      focusToot,
      sizeChanged,
      openSideBar,
      heading,
      upper
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
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
