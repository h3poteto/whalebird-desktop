<template>
  <div id="home">
    <div class="home-timeline" v-for="(message, index) in timeline" v-bind:key="index">
      <toot :message="message"></toot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Toot'

export default {
  name: 'home',
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.homeTimeline
    })
  },
  created () {
    // TODO: Get recent timeline and concat timeline before stream
  }
}
</script>

<style lang="scss" scoped>
.home-timeline {
  margin-left: 16px;
}
</style>
