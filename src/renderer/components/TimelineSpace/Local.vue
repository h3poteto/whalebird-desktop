<template>
  <div id="local">
    <div class="local-timeline" v-for="message in timeline" v-bind:key="message.id">
      <toot :message="message" v-on:update="updateToot"></toot>
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
      account: state => state.TimelineSpace.account,
      timeline: state => state.TimelineSpace.Local.timeline
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
    this.$store.dispatch('TimelineSpace/Local/stopLocalStreaming')
  },
  methods: {
    async initialize () {
      try {
        await this.$store.dispatch('TimelineSpace/Local/fetchLocalTimeline', this.account)
      } catch (err) {
        this.$message({
          message: 'Could not fetch timeline',
          type: 'error'
        })
      }
      this.$store.dispatch('TimelineSpace/Local/startLocalStreaming', this.account)
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Local/updateToot', message)
    }
  }
}
</script>
