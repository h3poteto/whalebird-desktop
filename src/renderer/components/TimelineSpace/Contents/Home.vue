<template>
  <div id="home">
    <div class="home-timeline" v-for="(message, index) in timeline" v-bind:key="index">
      <toot :message="message"></toot>
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
      timeline: state => state.TimelineSpace.homeTimeline,
      lazyLoading: state => state.TimelineSpace.Contents.Home.lazyLoading,
      backgroundColor: state => state.App.theme.background_color
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
    this.$store.commit('TimelineSpace/archiveHomeTimeline')
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
    }
  },
  methods: {
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('home').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Home/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
      }
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
