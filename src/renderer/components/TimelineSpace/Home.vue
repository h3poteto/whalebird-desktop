<template>
  <div id="home">
    <div class="home-timeline" v-for="(message, index) in timeline" v-bind:key="index">
      <toot :message="message"></toot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Cards/Toot'

export default {
  name: 'home',
  components: { Toot },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', false)
  },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.homeTimeline
    })
  }
}
</script>

