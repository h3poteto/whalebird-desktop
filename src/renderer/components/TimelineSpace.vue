<template>
<div
  id="timeline_space"
  v-loading="loading"
  element-loading-text="Loading..."
  element-loading-spinner="el-icon-loading"
  element-loading-background="rgba(0, 0, 0, 0.8)">
  <side-menu></side-menu>
  <div :class="collapse ? 'page-narrow':'page'">
    <header class="header" style="-webkit-app-region: drag;">
      <header-menu></header-menu>
    </header>
    <contents></contents>
  </div>
  <modals></modals>
</div>
</template>

<script>
import { mapState } from 'vuex'
import SideMenu from './TimelineSpace/SideMenu'
import HeaderMenu from './TimelineSpace/HeaderMenu'
import Contents from './TimelineSpace/Contents'
import Modals from './TimelineSpace/Modals'
import Mousetrap from 'mousetrap'

export default {
  name: 'timeline-space',
  components: { SideMenu, HeaderMenu, Modals, Contents },
  computed: {
    ...mapState({
      loading: state => state.TimelineSpace.loading,
      collapse: state => state.TimelineSpace.SideMenu.collapse
    })
  },
  created () {
    this.$store.commit('TimelineSpace/changeLoading', true)
    this.initialize()
      .finally(() => {
        this.$store.commit('TimelineSpace/changeLoading', false)
        this.$store.commit('GlobalHeader/updateChanging', false)
      })
  },
  mounted () {
    Mousetrap.bind(['command+t', 'ctrl+t'], () => {
      this.$store.commit('TimelineSpace/Modals/Jump/changeModal', true)
    })
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/stopUserStreaming')
    this.$store.dispatch('TimelineSpace/stopLocalStreaming')
  },
  methods: {
    async clear () {
      await this.$store.dispatch('TimelineSpace/clearAccount')
      await this.$store.commit('TimelineSpace/Contents/Home/clearTimeline')
      await this.$store.commit('TimelineSpace/Contents/Local/clearTimeline')
      await this.$store.commit('TimelineSpace/Contents/Notifications/clearNotifications')
      await this.$store.dispatch('TimelineSpace/removeShortcutEvents')
      await this.$store.dispatch('TimelineSpace/clearUnread')
      return 'clear'
    },
    async initialize () {
      await this.clear()

      this.$store.dispatch('TimelineSpace/watchShortcutEvents')
      const account = await this.$store.dispatch('TimelineSpace/localAccount', this.$route.params.id).catch(() => {
        this.$message({
          message: 'Could not find account',
          type: 'error'
        })
      })
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Home/fetchTimeline', account)
      } catch (err) {
        this.$message({
          message: 'Could not fetch timeline',
          type: 'error'
        })
      }
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Notifications/fetchNotifications', account)
      } catch (err) {
        this.$message({
          message: 'Could not fetch notification',
          type: 'error'
        })
      }
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)
      } catch (err) {
        this.$message({
          message: 'Could not fetch local timeline',
          type: 'error'
        })
      }
      this.$store.dispatch('TimelineSpace/SideMenu/fetchLists', account)
      this.$store.dispatch('TimelineSpace/startUserStreaming', account)
        .catch(() => {
          this.$message({
            message: 'Failed to start streaming',
            type: 'error'
          })
        })
      this.$store.dispatch('TimelineSpace/startLocalStreaming', account)
    }
  }
}
</script>

<style lang="scss" scoped>
#timeline_space {
  height: 100%;
}
.page {
  margin-left: 180px;
  height: 100%;
  box-sizing: border-box;

  .header {
    width: calc(100% - 245px);
    position: fixed;
    top: 0;
    left: 245px;
    height: 48px;
    border-bottom: solid 1px var(--theme-border-color);
  }
}

.page-narrow {
  margin-left: 76px;
  height: 100%;
  box-sizing: border-box;

  .header {
    width: calc(100% - 141px);
    position: fixed;
    top: 0;
    left: 141px;
    height: 48px;
    border-bottom: solid 1px var(--theme-border-color);
  }
}

</style>
