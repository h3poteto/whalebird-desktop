<template>
  <div class="side-bar" v-if="openSideBar">
    <div class="header">
      <el-button class="action" link @click="reload">
        <font-awesome-icon icon="rotate" />
      </el-button>
      <el-button link class="action" @click="close">
        <font-awesome-icon icon="xmark" />
      </el-button>
    </div>
    <div id="sidebar_scrollable">
      <account-profile v-if="component === 1" v-on:change-loading="changeLoading"></account-profile>
      <toot-detail v-else-if="component === 2"></toot-detail>
      <div
        class="loading"
        v-loading="true"
        :element-loading-text="$t('message.loading')"
        element-loading-spinner="el-icon-loading"
        :element-loading-background="backgroundColor"
        v-else
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, computed, onBeforeUnmount } from 'vue'
import TootDetail from './SideBar/TootDetail.vue'
import AccountProfile from './SideBar/AccountProfile.vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Contents/SideBar'

export default defineComponent({
  components: {
    TootDetail,
    AccountProfile
  },
  name: 'side-bar',
  props: {
    overlaid: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const space = 'TimelineSpace/Contents/SideBar'
    const store = useStore()

    const { overlaid } = toRefs(props)
    const loading = ref<boolean>(false)

    const openSideBar = computed(() => store.state.TimelineSpace.Contents.SideBar.openSideBar)
    const component = computed(() => store.state.TimelineSpace.Contents.SideBar.component)
    const backgroundColor = computed(() => store.state.App.theme.background_color)
    const shortcutEnabled = computed(() => !overlaid.value)

    onBeforeUnmount(() => {
      close()
    })

    const close = () => {
      store.dispatch(`${space}/${ACTION_TYPES.CLOSE}`)
    }
    const changeLoading = (value: boolean) => {
      loading.value = value
    }
    const reload = () => {
      store.dispatch(`${space}/${ACTION_TYPES.RELOAD}`)
    }

    return {
      openSideBar,
      component,
      backgroundColor,
      shortcutEnabled,
      changeLoading,
      reload,
      close
    }
  }
})
</script>

<style lang="scss" scoped>
.side-bar {
  .header {
    background-color: var(--theme-selected-background-color);
    padding: 4px 8px;
    border-top: solid 1px var(--theme-border-color);
    border-bottom: solid 1px var(--theme-border-color);
    text-align: right;
    height: 36px;
    box-sizing: border-box;
    font-size: 18px;

    .action {
      color: var(--theme-secondary-color);
      padding: 0;
      margin-left: 8px;

      &:hover {
        color: #409eff;
      }
    }
  }

  #sidebar_scrollable {
    overflow: auto;
    height: calc(100% - 30px);
  }

  .loading {
    height: 100%;
  }
}
</style>
