<template>
  <div class="notification">
    <StatusReaction
      v-if="message.type === 'favourite'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reaction-type="favourite"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <follow
      v-else-if="message.type === 'follow'"
      :message="message"
      :focused="focused"
      :overlaid="overlaid"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </follow>
    <FollowRequest
      v-else-if="message.type === 'follow_request'"
      :message="message"
      :focused="focused"
      :overlaid="overlaid"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </FollowRequest>
    <mention
      v-else-if="message.type === 'mention'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      @update="updateToot"
      @delete="deleteToot"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </mention>
    <StatusReaction
      v-else-if="message.type === 'reblog' && message.status?.quote"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reaction-type="quote"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <StatusReaction
      v-else-if="message.type === 'reblog' && !message.status?.quote"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reaction-type="reblog"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <status
      v-else-if="message.type === 'status'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </status>
    <StatusReaction
      v-else-if="message.type === 'poll_vote'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reaction-type="poll-vote"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <StatusReaction
      v-else-if="message.type === 'poll_expired'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reaction-type="poll-expired"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
    <StatusReaction
      v-else-if="message.type === 'emoji_reaction'"
      :message="message"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      reaction-type="emoji-reaction"
      @focus-right="$emit('focusRight')"
      @select="$emit('selectNotification')"
    >
    </StatusReaction>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Entity } from 'megalodon'
import StatusReaction from './Notification/StatusReaction.vue'
import Follow from './Notification/Follow.vue'
import FollowRequest from './Notification/FollowRequest.vue'
import Mention from './Notification/Mention.vue'
import Status from './Notification/Status.vue'

export default defineComponent({
  name: 'Notification',
  components: {
    StatusReaction,
    Follow,
    FollowRequest,
    Mention,
    Status
  },
  props: {
    message: {
      type: Object as PropType<Entity.Notification>,
      default: () => ({})
    },
    filters: {
      type: Array as PropType<Array<Entity.Filter>>,
      default: () => []
    },
    focused: {
      type: Boolean,
      default: () => false
    },
    overlaid: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ['focusRight', 'selectNotification', 'update', 'delete'],
  setup(_props, ctx) {
    const updateToot = (message: Entity.Status) => {
      return ctx.emit('update', message)
    }
    const deleteToot = (message: Entity.Status) => {
      return ctx.emit('delete', message)
    }

    return {
      updateToot,
      deleteToot
    }
  }
})
</script>
