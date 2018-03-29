<template>
<div id="notification">
  <favourite v-if="message.type === 'favourite'" :message="message"></favourite>
  <follow v-if="message.type === 'follow'" :message="message"></follow>
  <mention v-if="message.type === 'mention'" :message="message"></mention>
  <reblog v-if="message.type == 'reblog'" :message="message"></reblog>
</div>
</template>

<script>
import Favourite from './Notification/Favourite'
import Follow from './Notification/Follow'
import Mention from './Notification/Mention'
import Reblog from './Notification/Reblog'

export default {
  name: 'notification',
  props: ['message'],
  components: { Favourite, Follow, Mention, Reblog }
}
</script>

