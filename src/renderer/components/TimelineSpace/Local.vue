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
    this.$store.dispatch('TimelineSpace/Local/startLocalStreaming', this.account)
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Local/stopLocalStreaming')
  },
  methods: {
    updateToot (message) {
      this.$store.commit('TimelineSpace/Local/updateToot', message)
    }
  }
}
</script>

<style lang="scss" scoped>
#local {
  margin-left: 16px;
}
</style>
