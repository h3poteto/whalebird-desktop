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
  },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
  },
  beforeUpdate () {
    if (this.$store.state.TimelineSpace.SideMenu.unreadNotifications) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    }
  }
}
</script>
