<template>
  <div id="public">
    <div class="public-timeline" v-for="message in timeline" v-bind:key="message.id">
      <toot :message="message" v-on:update="updateToot"></toot>
    </div>
    <div class="loading-card" v-loading="lazyLoading">
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
      timeline: state => state.TimelineSpace.Public.timeline,
      lazyLoading: state => state.TimelineSpace.Public.lazyLoading
    })
  },
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
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Public/stopPublicStreaming')
  },
  destroyed () {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    async initialize () {
      try {
        await this.$store.dispatch('TimelineSpace/Public/fetchPublicTimeline')
      } catch (err) {
        this.$message({
          message: 'Could not fetch timeline',
          type: 'error'
        })
      }
      this.$store.dispatch('TimelineSpace/Public/startPublicStreaming')
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Public/updateToot', message)
    },
    onScroll (event) {
      if (((document.documentElement.clientHeight + event.target.defaultView.scrollY) >= document.getElementById('public').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Public/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-card {
  background-color: #ffffff;
  height: 60px;
}

.loading-card:empty {
  height: 0;
}
</style>
