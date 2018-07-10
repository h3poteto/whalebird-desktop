<template>
  <div id="public">
    <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
    <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
    </div>
    <transition-group name="timeline" tag="div">
      <div class="public-timeline" v-for="message in timeline" v-bind:key="message.id">
        <toot :message="message" :filter="filter" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
      </div>
    </transition-group>
    <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor">
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Cards/Toot'

export default {
  name: 'public',
  components: { Toot },
  computed: {
    ...mapState({
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      timeline: state => state.TimelineSpace.Contents.Public.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Public.lazyLoading,
      heading: state => state.TimelineSpace.Contents.Public.heading,
      unread: state => state.TimelineSpace.Contents.Public.unreadTimeline,
      filter: state => state.TimelineSpace.Contents.Public.filter
    })
  },
  created () {
    this.$store.commit('TimelineSpace/changeLoading', true)
    this.initialize()
      .finally(() => {
        this.$store.commit('TimelineSpace/changeLoading', false)
      })
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Contents/Public/stopPublicStreaming')
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Public/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Public/mergeTimeline')
    this.$store.commit('TimelineSpace/Contents/Public/archiveTimeline')
    this.$store.commit('TimelineSpace/Contents/Public/clearTimeline')
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  watch: {
    startReload: function (newState, oldState) {
      if (!oldState && newState) {
        this.reload()
          .finally(() => {
            this.$store.commit('TimelineSpace/HeaderMenu/changeReload', false)
          })
      }
    }
  },
  methods: {
    async initialize () {
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Public/fetchPublicTimeline')
      } catch (err) {
        this.$message({
          message: 'Could not fetch timeline',
          type: 'error'
        })
      }
      this.$store.dispatch('TimelineSpace/Contents/Public/startPublicStreaming')
        .catch(() => {
          this.$message({
            message: 'Failed to start streaming',
            type: 'error'
          })
        })
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Public/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/Public/deleteToot', message)
    },
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('public').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Public/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
          .catch(() => {
            this.$message({
              message: 'Could not fetch timeline',
              type: 'error'
            })
          })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Public/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Public/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Public/mergeTimeline')
      }
    },
    async reload () {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        const account = await this.$store.dispatch('TimelineSpace/localAccount', this.$route.params.id).catch((err) => {
          this.$message({
            message: 'Could not find account',
            type: 'error'
          })
          throw err
        })
        await this.$store.dispatch('TimelineSpace/stopUserStreaming')
        await this.$store.dispatch('TimelineSpace/stopLocalStreaming')
        await this.$store.dispatch('TimelineSpace/Contents/Public/stopPublicStreaming')

        await this.$store.dispatch('TimelineSpace/Contents/Home/fetchTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Public/fetchPublicTimeline')
          .catch(() => {
            this.$message({
              message: 'Could not fetch public timeline',
              type: 'error'
            })
          })

        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
        this.$store.dispatch('TimelineSpace/startLocalStreaming', account)
        this.$store.dispatch('TimelineSpace/Contents/Public/startPublicStreaming')
          .catch(() => {
            this.$message({
              message: 'Failed to restart streaming',
              type: 'error'
            })
          })
      } finally {
        this.$store.commit('TimelineSpace/changeLoading', false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#public {
  .unread {
    position: fixed;
    right: 24px;
    top: 48px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 0 0 2px 2px;

    &:empty {
      display: none;
    }
  }

  .loading-card {
    height: 60px;
  }

  .loading-card:empty {
    height: 0;
  }
}
</style>
<style src="@/assets/timeline-transition.scss"></style>
