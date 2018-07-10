<template>
<div id="notification">
  <favourite v-if="message.type === 'favourite'" :message="message" :filter="filter"></favourite>
  <follow v-else-if="message.type === 'follow'" :message="message"></follow>
  <mention v-else-if="message.type === 'mention'" :message="message" :filter="filter"></mention>
  <reblog v-else-if="message.type == 'reblog'" :message="message" :filter="filter"></reblog>
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
    }
  },
  components: { Favourite, Follow, Mention, Reblog }
}
</script>

