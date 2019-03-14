<template>
<div class="notification">
  <favourite v-if="message.type === 'favourite'"
             :message="message"
             :filter="filter"
             :focused="focused"
             :overlaid="overlaid"
             @focusNext="$emit('focusNext')"
             @focusPrev="$emit('focusPrev')"
             @focusRight="$emit('focusRight')"
             @select="$emit('selectNotification')"
             >
  </favourite>
  <follow v-else-if="message.type === 'follow'"
          :message="message"
          :focused="focused"
          :overlaid="overlaid"
          @focusNext="$emit('focusNext')"
          @focusPrev="$emit('focusPrev')"
          @focusRight="$emit('focusRight')"
          @select="$emit('selectNotification')"
          >
  </follow>
   <mention v-else-if="message.type === 'mention'"
            :message="message"
            :filter="filter"
            :focused="focused"
            :overlaid="overlaid"
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @focusNext="$emit('focusNext')"
            @focusPrev="$emit('focusPrev')"
            @focusRight="$emit('focusRight')"
            @select="$emit('selectNotification')"
            >
   </mention>
   <reblog v-else-if="message.type == 'reblog'"
           :message="message"
           :filter="filter"
           :focused="focused"
           :overlaid="overlaid"
           @focusNext="$emit('focusNext')"
           @focusPrev="$emit('focusPrev')"
           @focusRight="$emit('focusRight')"
           @select="$emit('selectNotification')"
           >
   </reblog>
</div>
</template>

<script>
import Favourite from './Notification/Favourite'
import Follow from './Notification/Follow'
import Mention from './Notification/Mention'
import Reblog from './Notification/Reblog'

export default {
  name: 'notification',
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
      defalt: false
    },
    overlaid: {
      type: Boolean,
      default: false
    }
  },
  components: { Favourite, Follow, Mention, Reblog },
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

