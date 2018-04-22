<template>
  <div id="home">
    <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
    <div class="home-timeline" v-for="(message, index) in timeline" v-bind:key="index">
      <toot :message="message" :key="message.id" v-on:update="updateToot"></toot>
    </div>
    <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor">
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Cards/Toot'

export default {
  name: 'home',
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.Contents.Home.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Home.lazyLoading,
      backgroundColor: state => state.App.theme.background_color,
      heading: state => state.TimelineSpace.Contents.Home.heading,
      unread: state => state.TimelineSpace.Contents.Home.unreadTimeline
    })
  },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', false)
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  beforeUpdate () {
    if (this.$store.state.TimelineSpace.SideMenu.unreadHomeTimeline) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', false)
    }
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Home/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Home/mergeTimeline')
    this.$store.commit('TimelineSpace/Contents/Home/archiveTimeline')
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  methods: {
    onScroll (event) {
      // for lazyLoading
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('home').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Home/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
          .catch(() => {
            this.$message({
              message: 'Could not fetch home timeline',
              type: 'error'
            })
          })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Home/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Home/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Home/mergeTimeline')
      }
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Home/updateToot', message)
    }
  }
}
</script>

<style lang="scss" scoped>
#home {
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
