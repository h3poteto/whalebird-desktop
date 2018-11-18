<template>
<div id="account_timeline">
  <template v-for="message in timeline">
    <toot :message="message" :key="message.id" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
  </template>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor">
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '~/src/renderer/components/molecules/Toot'

export default {
  name: 'timeline',
  props: [ 'account' ],
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.Contents.SideBar.AccountProfile.Timeline.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.SideBar.AccountProfile.Timeline.lazyLoading,
      backgroundColor: state => state.App.theme.background_color
    })
  },
  created () {
    this.load()
  },
  mounted () {
    document.getElementById('sidebar_scrollable').addEventListener('scroll', this.onScroll)
  },
  destroyed () {
    if (document.getElementById('sidebar_scrollable') !== undefined && document.getElementById('sidebar_scrollable') !== null) {
      document.getElementById('sidebar_scrollable').removeEventListener('scroll', this.onScroll)
    }
  },
  watch: {
    account: function (newAccount, oldAccount) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/clearTimeline')
      this.load()
    }
  },
  methods: {
    load () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/fetchTimeline', this.account)
        .catch(() => {
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
    },
    onScroll (event) {
      // for lazyLoading
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('account_profile').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch(
          'TimelineSpace/Contents/SideBar/AccountProfile/Timeline/lazyFetchTimeline',
          {
            account: this.account,
            last: this.timeline[this.timeline.length - 1]
          })
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/deleteToot', message)
    }
  }
}
</script>

<style lang="scss" scoped>
  .loading-card {
    height: 60px;
  }

  .loading-card:empty {
    height: 0;
  }
</style>
