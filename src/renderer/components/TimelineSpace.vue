<template>
<div id="timeline_space">
  <side-menu></side-menu>
  <div class="page">
    <header class="header" style="-webkit-app-region: drag;">
      <header-menu></header-menu>
    </header>
    <contents></contents>
  </div>
  <new-toot></new-toot>
  <jump-modal></jump-modal>
  <image-viewer></image-viewer>
</div>
</template>

<script>
import SideMenu from './TimelineSpace/SideMenu'
import HeaderMenu from './TimelineSpace/HeaderMenu'
import NewToot from './TimelineSpace/Modals/NewToot'
import JumpModal from './TimelineSpace/JumpModal'
import ImageViewer from './TimelineSpace/Modals/ImageViewer'
import Contents from './TimelineSpace/Contents'

export default {
  name: 'timeline-space',
  components: { SideMenu, HeaderMenu, NewToot, JumpModal, ImageViewer, Contents },
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
      })
      .catch(() => {
        loading.close()
      })
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/stopUserStreaming')
  },
  methods: {
    async clear () {
      await this.$store.dispatch('TimelineSpace/clearAccount')
      await this.$store.dispatch('TimelineSpace/clearUsername')
      await this.$store.dispatch('TimelineSpace/clearTimeline')
      await this.$store.dispatch('TimelineSpace/clearNotifications')
      await this.$store.dispatch('TimelineSpace/removeShortcutEvents')
      return 'clear'
    },
    async initialize () {
      await this.clear()

      this.$store.dispatch('TimelineSpace/watchShortcutEvents')
      try {
        const account = await this.$store.dispatch('TimelineSpace/fetchAccount', this.$route.params.id)
        try {
          await this.$store.dispatch('TimelineSpace/fetchHomeTimeline', account)
        } catch (err) {
          this.$message({
            message: 'Could not fetch timeline',
            type: 'error'
          })
        }
        try {
          await this.$store.dispatch('TimelineSpace/username', account)
        } catch (err) {
          this.$message({
            message: 'Could not fetch username',
            type: 'error'
          })
        }
        try {
          await this.$store.dispatch('TimelineSpace/fetchNotifications', account)
        } catch (err) {
          this.$message({
            message: 'Could not fetch notification',
            type: 'error'
          })
        }
        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
      } catch (err) {
        this.$message({
          message: 'Could not find account',
          type: 'error'
        })
      }
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
    width: 100%;
    position: fixed;
    top: 0;
    left: 245px;
    height: 48px;
    background-color: #ffffff;
    border-bottom: solid 1px #dcdfe6;
  }
}

</style>
