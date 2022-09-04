<template>
  <div id="bookmarks">
    <div></div>
    <DynamicScroller :items="bookmarks" :min-item-size="60" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            :message="item"
            :focused="item.uri === focusedId"
            :overlaid="modalOpened"
            :filters="[]"
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @focusRight="focusSidebar"
            @selectToot="focusToot(item)"
          ></toot>
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
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useMagicKeys, whenever, and } from '@vueuse/core'
import { useStore } from '@/store'
import { useI18next } from 'vue3-i18next'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import useReloadable from '@/components/utils/reloadable'
import Toot from '@/components/organisms/Toot.vue'
import { EventEmitter } from '@/components/event'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Bookmarks'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'

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
    const { j, k, Ctrl_r } = useMagicKeys()

    const bookmarks = computed(() => store.state.TimelineSpace.Contents.Bookmarks.bookmarks)
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Bookmarks.lazyLoading)
    const account = computed(() => store.state.TimelineSpace.account)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => bookmarks.value.findIndex(toot => focusedId.value === toot.uri))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(() => {
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)
      store.commit(`TimelineSpace/Contents/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      store
        .dispatch(`${space}/${ACTION_TYPES.FETCH_BOOKMARKS}`, account.value)
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

    whenever(and(j, shortcutEnabled), () => {
      if (focusedId.value === null) {
        focusedId.value = bookmarks.value[0].uri
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

    const onScroll = (event: Event) => {
      if (
        (event.target as HTMLElement)!.clientHeight + (event.target as HTMLElement)!.scrollTop >=
          document.getElementById('scroller')!.scrollHeight - 10 &&
        !lazyLoading.value
      ) {
        store.dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_BOOKMARKS}`, bookmarks.value[bookmarks.value.length - 1]).catch(() => {
          ElMessage({
            message: i18n.t('message.bookmark_fetch_error'),
            type: 'error'
          })
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
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_BOOKMARKS}`, account.value).catch(() => {
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
    const focusSidebar = () => {
      EventEmitter.emit('focus-sidebar')
    }

    return {
      scroller,
      bookmarks,
      focusedId,
      modalOpened,
      updateToot,
      deleteToot,
      focusSidebar,
      focusToot,
      openSideBar,
      heading,
      upper
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
