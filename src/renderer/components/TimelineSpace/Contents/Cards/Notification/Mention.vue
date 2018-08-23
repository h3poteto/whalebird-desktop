<template>
  <div class="mention">
    <toot
      :message="message.status"
      :filter="filter"
      :focused="focused"
      :overlaid="overlaid"
      v-on:update="updateToot"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @selectToot="$emit('select')"
      >
    </toot>
  </div>
</template>

<script>
import Toot from '../Toot'

export default {
  name: 'mention',
  props: {
    message: {
      type: Object,
      default: {}
    },
    filter: {
      type: String,
      default: ''
    },
    focused: {
      type: Boolean,
      default: false
    },
    overlaid: {
      type: Boolean,
      default: false
    }
  },
  components: { Toot },
  methods: {
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Notifications/updateToot', message)
    }
  }
}
</script>
