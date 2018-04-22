<template>
  <div class="mention">
    <toot :message="message.status" v-on:update="updateToot"></toot>
  </div>
</template>

<script>
import Toot from '../Toot'

export default {
  name: 'mention',
  props: ['message'],
  components: { Toot },
  methods: {
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Notifications/updateToot', message)
    }
  }
}
</script>
