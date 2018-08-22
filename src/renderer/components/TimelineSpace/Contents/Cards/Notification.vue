<template>
<div class="notification">
  <favourite v-if="message.type === 'favourite'"
             :message="message"
             :filter="filter"
             :focused="focused"
             @focusNext="$emit('focusNext')"
             @focusPrev="$emit('focusPrev')"
             @select="$emit('selectNotification')"
             >
  </favourite>
  <follow v-else-if="message.type === 'follow'"
          :message="message"
          :focused="focused"
          @focusNext="$emit('focusNext')"
          @focusPrev="$emit('focusPrev')"
          @select="$emit('selectNotification')"
          >
  </follow>
   <mention v-else-if="message.type === 'mention'"
            :message="message"
            :filter="filter"
            :focused="focused"
            @focusNext="$emit('focusNext')"
            @focusPrev="$emit('focusPrev')"
            @select="$emit('selectNotification')"
            >
   </mention>
   <reblog v-else-if="message.type == 'reblog'"
           :message="message"
           :filter="filter"
           :focused="focused"
           @focusNext="$emit('focusNext')"
           @focusPrev="$emit('focusPrev')"
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
    }
  },
  components: { Favourite, Follow, Mention, Reblog }
}
</script>

