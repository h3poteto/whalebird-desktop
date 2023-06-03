<template>
  <side-menu></side-menu>
  <el-container class="timeline-space">
    <el-header class="header">
      <header-menu></header-menu>
    </el-header>
    <el-main class="main">
      <div class="contents-wrapper" ref="contentsRef">
        <contents />
      </div>
      <div class="compose-wrapper">
        <compose />
        <resize-observer @notify="composeResized" />
      </div>
    </el-main>
  </el-container>
  <el-aside class="detail" v-if="detail">
    <Detail />
  </el-aside>
  <modals></modals>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import SideMenu from './TimelineSpace/SideMenu.vue'
import HeaderMenu from './TimelineSpace/HeaderMenu.vue'
import Contents from './TimelineSpace/Contents.vue'
import Compose from './TimelineSpace/Compose.vue'
import Modals from './TimelineSpace/Modals.vue'
import Detail from './TimelineSpace/Detail.vue'
import Mousetrap from 'mousetrap'
import { AccountLoadError } from '@/errors/load'
import { TimelineFetchError } from '@/errors/fetch'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace'
import { MUTATION_TYPES as GLOBAL_HEADER_MUTATION } from '@/store/GlobalHeader'
import { MUTATION_TYPES as JUMP_MUTATION } from '@/store/TimelineSpace/Modals/Jump'

export default defineComponent({
  name: 'timeline-space',
  components: { SideMenu, HeaderMenu, Modals, Contents, Compose, Detail },
  setup() {
    const space = 'TimelineSpace'
    const store = useStore()
    const route = useRoute()
    const { t } = useTranslation()

    const contentsRef = ref<HTMLElement | null>(null)

    const loading = computed(() => store.state.TimelineSpace.loading)
    const detail = computed(() => route.query.detail?.toString() === 'true')

    onMounted(async () => {
      await initialize().finally(() => {
        store.commit(`GlobalHeader/${GLOBAL_HEADER_MUTATION.UPDATE_CHANGING}`, false)
      })

      Mousetrap.bind(['command+t', 'ctrl+t'], () => {
        store.commit(`TimelineSpace/Modals/Jump/${JUMP_MUTATION.CHANGE_MODAL}`, true)
      })
    })

    const clear = async () => {
      await store.dispatch(`${space}/${ACTION_TYPES.CLEAR_ACCOUNT}`)
      await store.dispatch(`${space}/${ACTION_TYPES.REMOVE_SHORTCUT_EVENTS}`)
      await store.dispatch(`${space}/${ACTION_TYPES.CLEAR_UNREAD}`)
      return 'clear'
    }
    const initialize = async () => {
      await clear()

      try {
        await store.dispatch(`${space}/${ACTION_TYPES.INIT_LOAD}`, route.params.id)
      } catch (err) {
        if (err instanceof AccountLoadError) {
          ElMessage({
            message: t('message.account_load_error'),
            type: 'error'
          })
        } else if (err instanceof TimelineFetchError) {
          ElMessage({
            message: t('message.timeline_fetch_error'),
            type: 'error'
          })
        }
      }

      await store.dispatch(`${space}/${ACTION_TYPES.PREPARE_SPACE}`)
    }

    const composeResized = (event: { width: number; height: number }) => {
      if (contentsRef.value) {
        contentsRef.value.style.setProperty('height', `calc(100% - ${event.height}px)`)
      }
    }

    return {
      loading,
      composeResized,
      contentsRef,
      detail
    }
  }
})
</script>

<style lang="scss" scoped>
.timeline-space {
  height: 100%;
}

.header {
  padding: 0;
  height: auto;
  border-bottom: 1px solid var(--theme-border-color);
}

.main {
  padding: 0;
}

.compose-wrapper {
  position: sticky;
  bottom: 0;
  padding: 0 12px 18px 12px;
}

.detail {
  width: 380px;
  height: 100%;
  border-left: 1px solid var(--theme-border-color);
}
</style>
