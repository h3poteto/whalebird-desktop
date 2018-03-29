<template>
  <div id="notifications">
    <div class="notifications" v-for="message in notifications" v-bind:key="message.id">
      <notification :message="message"></notification>
    </div>
    <div class="loading-card" v-loading="lazyLoading">
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
      notifications: state => state.TimelineSpace.notifications,
      lazyLoading: state => state.TimelineSpace.Contents.Notifications.lazyLoading
    })
  },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    window.addEventListener('scroll', this.onScroll)
  },
  beforeUpdate () {
    if (this.$store.state.TimelineSpace.SideMenu.unreadNotifications) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    }
  },
  destroyed () {
    this.$store.commit('TimelineSpace/archiveNotifications')
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll (event) {
      if (((document.documentElement.clientHeight + event.target.defaultView.scrollY) >= document.getElementById('notifications').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Notifications/lazyFetchNotifications', this.notifications[this.notifications.length - 1])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-card {
  background-color: #ffffff;
  height: 60px;
}

.loading-card:empty {
  height: 0;
}
</style>
