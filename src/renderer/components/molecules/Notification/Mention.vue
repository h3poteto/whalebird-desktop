<template>
  <div class="mention">
    <toot
      :message="message.status"
      :filter="filter"
      :focused="focused"
      :overlaid="overlaid"
      v-on:update="updateToot"
      v-on:delete="deleteToot"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
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
      return this.$emit('update', message)
    },
    deleteToot (message) {
      return this.$emit('delete', message)
    }
  }
}
</script>
