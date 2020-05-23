<template>
  <div class="notification">
    <favourite
      v-if="message.type === 'favourite'"
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
    <follow
      v-else-if="message.type === 'follow'"
      :message="message"
      :focused="focused"
      :overlaid="overlaid"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </follow>
    <FollowRequest
      v-else-if="message.type === 'follow_request'"
      :message="message"
      :focused="focused"
      :overlaid="overlaid"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </FollowRequest>
    <mention
      v-else-if="message.type === 'mention'"
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
    <quote
      v-else-if="message.type === 'reblog' && message.status.quote"
      :message="message"
      :filter="filter"
      :focused="focused"
      :overlaid="overlaid"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </quote>
    <reblog
      v-else-if="message.type === 'reblog' && !message.status.quote"
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
    <reaction
      v-else-if="message.type === 'emoji_reaction'"
      :message="message"
      :filter="filter"
      :focused="focused"
      :overlaid="overlaid"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </reaction>
  </div>
</template>

<script>
import Favourite from './Notification/Favourite'
import Follow from './Notification/Follow'
import FollowRequest from './Notification/FollowRequest'
import Mention from './Notification/Mention'
import Quote from './Notification/Quote'
import Reblog from './Notification/Reblog'
import Reaction from './Notification/Reaction'

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
  components: { Favourite, Follow, FollowRequest, Mention, Quote, Reblog, Reaction },
  methods: {
    updateToot(message) {
      return this.$emit('update', message)
    },
    deleteToot(message) {
      return this.$emit('delete', message)
    }
  }
}
</script>
