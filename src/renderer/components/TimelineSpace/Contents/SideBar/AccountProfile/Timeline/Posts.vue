<template>
  <div id="timeline">
    <template v-for="message in pinnedToots" :key="message.id">
      <toot
        :message="message"
        :focused="message.uri + message.id === focusedId"
        :pinned="true"
        :overlaid="modalOpened"
        :filters="filters"
        v-on:update="updatePinnedToot"
        v-on:delete="deleteToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusLeft="focusTimeline"
        @selectToot="focusToot(message)"
      >
      </toot>
    </template>
    <DynamicScroller :items="timeline" :min-item-size="60" class="scroller" :buffer="buffer" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            :message="item"
            :key="item.id"
            :focused="item.uri + item.id === focusedId"
            :overlaid="modalOpened"
            :filters="filters"
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @focusNext="focusNext"
            @focusPrev="focusPrev"
            @focusLeft="focusTimeline"
            @selectToot="focusToot(item)"
          >
          </toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, onMounted, onBeforeUnmount, onUnmounted, watch, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { EventEmitter } from '@/components/event'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/SideBar/AccountProfile/Timeline/Posts'

export default defineComponent({
  name: 'posts',
  components: { Toot },
  props: {
    account: {
      type: Object as PropType<Entity.Account>,
      required: true
    },
    buffer: {
      type: Number,
      required: true
    },
    filters: {
      type: Object as PropType<Array<Entity.Filter>>,
      required: true
    }
  },
  setup(props) {
    const space = 'TimelineSpace/Contents/SideBar/AccountProfile/Timeline/Posts'
    const store = useStore()
    const i18n = useI18next()
    const { account } = toRefs(props)

    const focusedId = ref<string | null>(null)

    const timeline = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.Timeline.Posts.timeline)
    const pinnedToots = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.Timeline.Posts.pinnedToots)
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.Timeline.Posts.lazyLoading)
    const backgroundColor = computed(() => store.state.App.theme.background_color)
    const modalOpened = computed(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))

    onMounted(() => {
      load()
      store.dispatch(`${space}/${ACTION_TYPES.CLEAR_TIMELINE}`)
      document.getElementById('sidebar_scrollable')?.addEventListener('scroll', onScroll)
    })
    onBeforeUnmount(() => {
      EventEmitter.emit('focus-timeline')
      EventEmitter.off('focus-sidebar')
    })
    onUnmounted(() => {
      const el = document.getElementById('sidebar_scrollable')
      if (el !== undefined && el !== null) {
        el.removeEventListener('scroll', onScroll)
      }
    })
    watch(account, () => {
      store.dispatch(`${space}/${ACTION_TYPES.CLEAR_TIMELINE}`)
      load()
    })

    const load = () => {
      store.dispatch(`${space}/${ACTION_TYPES.FETCH_TIMELINE}`, account.value).catch(() => {
        ElMessage({
          message: i18n.t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
    }
    const onScroll = (event: Event) => {
      // for lazyLoading
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('account_profile')!.clientHeight - 10 &&
        !lazyLoading
      ) {
        store
          .dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_TIMELINE}`, {
            account: account.value,
            status: timeline[timeline.value.length - 1]
          })
          .catch(err => {
            console.error(err)
            ElMessage({
              message: i18n.t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }
    }
    const updatePinnedToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_PINNED_TOOT}`, message)
    }
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
    }
    const deleteToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message)
    }
    const focusNext = () => {
      if (currentFocusedIndex.value === -1) {
        focusedId.value = timeline.value[0].uri + timeline.value[0].id
      } else if (currentFocusedIndex.value < timeline.value.length - 1) {
        focusedId.value = timeline.value[currentFocusedIndex.value + 1].uri + timeline.value[currentFocusedIndex.value + 1].id
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value > 0) {
        focusedId.value = timeline.value[currentFocusedIndex.value - 1].uri + timeline.value[currentFocusedIndex.value - 1].id
      }
    }
    const focusToot = (message: Entity.Status) => {
      focusedId.value = message.uri + message.id
    }
    const focusTimeline = () => {
      focusedId.value = null
      EventEmitter.emit('focus-timeline')
    }

    return {
      pinnedToots,
      focusedId,
      modalOpened,
      updatePinnedToot,
      updateToot,
      deleteToot,
      focusNext,
      focusPrev,
      focusTimeline,
      focusToot,
      timeline,
      lazyLoading,
      backgroundColor
    }
  }
})
</script>

<style lang="scss" scoped>
.loading-card {
  height: 60px;
}

.loading-card:empty {
  height: 0;
}
</style>
