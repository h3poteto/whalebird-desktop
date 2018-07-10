<template>
<div name="list">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <transition-group name="timeline" tag="div">
    <div class="list-timeline" v-for="message in timeline" v-bind:key="message.id">
      <toot :message="message" :filter="filter" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
    </div>
  </transition-group>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '../Cards/Toot'

export default {
  name: 'list',
  props: ['list_id'],
  components: { Toot },
  computed: {
    ...mapState({
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      timeline: state => state.TimelineSpace.Contents.Lists.Show.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Lists.Show.lazyLoading,
      heading: state => state.TimelineSpace.Contents.Lists.Show.heading,
      unread: state => state.TimelineSpace.Contents.Lists.Show.unreadTimeline,
      filter: state => state.TimelineSpace.Contents.Lists.Show.filter
    })
  },
  created () {
    this.$store.commit('TimelineSpace/changeLoading', true)
    this.load()
      .finally(() => {
        this.$store.commit('TimelineSpace/changeLoading', false)
      })
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  watch: {
    list_id: function () {
      this.$store.commit('TimelineSpace/changeLoading', true)
      this.load()
        .finally(() => {
          this.$store.commit('TimelineSpace/changeLoading', false)
        })
    },
    startReload: function (newState, oldState) {
      if (!oldState && newState) {
        this.reload()
          .finally(() => {
            this.$store.commit('TimelineSpace/HeaderMenu/changeReload', false)
          })
      }
    }
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Contents/Lists/Show/stopStreaming')
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Lists/Show/mergeTimeline')
    this.$store.commit('TimelineSpace/Contents/Lists/Show/archiveTimeline')
    this.$store.commit('TimelineSpace/Contents/Lists/Show/clearTimeline')
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  methods: {
    async load () {
      await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/stopStreaming')
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/fetchTimeline', this.list_id)
      } catch (err) {
        this.$message({
          message: 'Failed to get timeline',
          type: 'error'
        })
      }
      this.$store.dispatch('TimelineSpace/Contents/Lists/Show/startStreaming', this.list_id)
        .catch(() => {
          this.$message({
            message: 'Failed to start streaming',
            type: 'error'
          })
        })
      return 'started'
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Lists/Show/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/Lists/Show/deleteToot', message)
    },
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementsByName('list')[0].clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Lists/Show/lazyFetchTimeline', {
          list_id: this.list_id,
          last: this.timeline[this.timeline.length - 1]
        })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Lists/Show/mergeTimeline')
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
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/stopStreaming')

        await this.$store.dispatch('TimelineSpace/Contents/Home/fetchTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/fetchTimeline', this.list_id)
          .catch(() => {
            this.$message({
              message: 'Could not fetch timeline',
              type: 'error'
            })
          })

        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
        this.$store.dispatch('TimelineSpace/startLocalStreaming', account)
        this.$store.dispatch('TimelineSpace/Contents/Lists/Show/startStreaming', this.list_id)
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
</style>
<style src="@/assets/timeline-transition.scss"></style>
