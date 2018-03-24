<template>
  <div id="public">
    <div class="public-timeline" v-for="message in timeline" v-bind:key="message.id">
      <toot :message="message" v-on:update="updateToot"></toot>
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
      timeline: state => state.TimelineSpace.Public.timeline
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
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Public/stopPublicStreaming')
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
    }
  }
}
</script>
