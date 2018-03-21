<template>
<div id="timeline_space">
  <side-menu></side-menu>
  <div class="content">
    <router-view></router-view>
  </div>
  <new-toot-modal></new-toot-modal>
  <jump-modal></jump-modal>
</div>
</template>

<script>
import SideMenu from './TimelineSpace/SideMenu'
import NewTootModal from './TimelineSpace/NewTootModal'
import JumpModal from './TimelineSpace/JumpModal'

export default {
  name: 'timeline-space',
  components: { SideMenu, NewTootModal, JumpModal },
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
.content {
  margin-left: 180px;
}

</style>
