<template>
  <div id="notifications">
    <div class="notifications" v-for="message in notifications" v-bind:key="message.id">
      <notification :message="message"></notification>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Notification from './Cards/Notification'

export default {
  name: 'notifications',
  components: { Notification },
  computed: {
    ...mapState({
      notifications: state => state.TimelineSpace.notifications
    })
  }
}
</script>

<style lang="scss" scoped>
.notifications {
  margin-left: 16px;
}
</style>
