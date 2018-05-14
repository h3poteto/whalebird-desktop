<template>
  <div id="local">
    <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
    <transition-group name="timeline" tag="div">
      <div class="local-timeline" v-for="message in timeline" v-bind:key="message.id">
        <toot :message="message" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
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
  name: 'local',
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.Contents.Local.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Local.lazyLoading,
      backgroundColor: state => state.App.theme.background_color,
      heading: state => state.TimelineSpace.Contents.Local.heading,
      unread: state => state.TimelineSpace.Contents.Local.unreadTimeline
    })
  },
  mounted () {
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Local/mergeTimeline')
    this.$store.commit('TimelineSpace/Contents/Local/archiveTimeline')
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  methods: {
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Local/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/Local/deleteToot', message)
    },
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('local').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Local/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
          .catch(() => {
            this.$message({
              message: 'Could not fetch timeline',
              type: 'error'
            })
          })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Local/mergeTimeline')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#local {
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
