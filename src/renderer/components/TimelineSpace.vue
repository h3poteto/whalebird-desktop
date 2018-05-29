<template>
<div id="timeline_space">
  <side-menu></side-menu>
  <div class="page">
    <header class="header" style="-webkit-app-region: drag;">
      <header-menu></header-menu>
    </header>
    <contents></contents>
  </div>
  <modals></modals>
</div>
</template>

<script>
import SideMenu from './TimelineSpace/SideMenu'
import HeaderMenu from './TimelineSpace/HeaderMenu'
import Contents from './TimelineSpace/Contents'
import Modals from './TimelineSpace/Modals'

export default {
  name: 'timeline-space',
  components: { SideMenu, HeaderMenu, Modals, Contents },
  created () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.initialize()
      .then(() => {
        loading.close()
        this.$store.commit('GlobalHeader/updateChanging', false)
      })
      .catch(() => {
        loading.close()
        this.$store.commit('GlobalHeader/updateChanging', false)
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

</style>
