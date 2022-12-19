<template>
  <div id="favourites">
    <div></div>
    <DynamicScroller :items="favourites" :min-item-size="60" id="scroller" class="scroller" ref="scroller">
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
import { defineComponent, computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { logicAnd } from '@vueuse/math'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { Entity } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'
import { EventEmitter } from '@/components/event'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Favourites'
import { MUTATION_TYPES as CONTENTS_MUTATION } from '@/store/TimelineSpace/Contents'
import { MUTATION_TYPES as HEADER_MUTATION } from '@/store/TimelineSpace/HeaderMenu'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'

export default defineComponent({
  name: 'favourites',
  components: { Toot },
  setup() {
    const space = 'TimelineSpace/Contents/Favourites'
    const store = useStore()
    const i18n = useI18next()

    const heading = ref<boolean>(false)
    const focusedId = ref<string | null>(null)
    const scroller = ref<any>()
    const { j, k, Ctrl_r } = useMagicKeys()

    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const startReload = computed(() => store.state.TimelineSpace.HeaderMenu.reload)
    const account = computed(() => store.state.TimelineSpace.account)
    const favourites = computed(() => store.state.TimelineSpace.Contents.Favourites.favourites)
    const lazyLoading = computed(() => store.state.TimelineSpace.Contents.Favourites.lazyLoading)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => favourites.value.findIndex(status => focusedId.value === status.uri))
    const shortcutEnabled = computed(() => !modalOpened.value)

    onMounted(() => {
      document.getElementById('scroller')?.addEventListener('scroll', onScroll)

      store.commit(`TimelineSpace/Contents/${CONTENTS_MUTATION.CHANGE_LOADING}`, true)
      store
        .dispatch(`${space}/${ACTION_TYPES.FETCH_FAVOURITES}`, account.value)
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
        store.dispatch(`${space}/${ACTION_TYPES.LAZY_FETCH_FAVOURITES}`, favourites.value[favourites.value.length - 1]).catch(() => {
          ElMessage({
            message: i18n.t('message.favourite_fetch_error'),
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
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
    }
    const deleteToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message)
    }
    const reload = async () => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_FAVOURITES}`, account.value).catch(() => {
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
    const focusSidebar = () => {
      EventEmitter.emit('focus-sidebar')
    }

    return {
      favourites,
      scroller,
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
#favourites {
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
