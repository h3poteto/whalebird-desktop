<template>
  <div class="notification">
    <StatusReaction
      v-if="message.type === 'favourite'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reactionType="favourite"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
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
      :filters="filters"
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
    <StatusReaction
      v-else-if="message.type === 'reblog' && message.status.quote"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reactionType="quote"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <StatusReaction
      v-else-if="message.type === 'reblog' && !message.status.quote"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reactionType="reblog"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <StatusReaction
      v-else-if="message.type === 'emoji_reaction'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reactiontype="reaction"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <status
      v-else-if="message.type === 'status'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </status>
    <StatusReaction
      v-else-if="message.type === 'poll_vote'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reactionType="poll-vote"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <StatusReaction
      v-else-if="message.type === 'poll_expired'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reactionType="poll-expired"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
  </div>
</template>

<script>
import StatusReaction from './Notification/StatusReaction'
import Follow from './Notification/Follow'
import FollowRequest from './Notification/FollowRequest'
import Mention from './Notification/Mention'
import Status from './Notification/Status'

export default {
  name: 'notification',
  props: {
    message: {
      type: Object,
      default: {}
    },
    filters: {
      type: Array,
      default: []
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
  components: {
    StatusReaction,
    Follow,
    FollowRequest,
    Mention,
    Status
  },
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
