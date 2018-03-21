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
      account: state => state.TimelineSpace.account,
      timeline: state => state.TimelineSpace.Public.timeline
    })
  },
  created () {
    this.$store.dispatch('TimelineSpace/Public/startPublicStreaming', this.account)
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Public/stopPublicStreaming')
  },
  methods: {
    updateToot (message) {
      this.$store.commit('TimelineSpace/Public/updateToot', message)
    }
  }
}
</script>
