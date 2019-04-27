<template>
<div id="notifications" v-shortkey="shortcutEnabled ? {next: ['j']} : {}" @shortkey="handleKey">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <transition-group name="timeline" tag="div">
    <div class="notifications" v-for="message in notifications" v-bind:key="message.id">
      <notification
        :message="message"
        :filter="filter"
        :focused="message.id === focusedId"
        :overlaid="modalOpened"
        v-on:update="updateToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusRight="focusSidebar"
        @selectNotification="focusNotification(message)"
        >
      </notification>
    </div>
  </transition-group>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor">
  </div>
  <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
    <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle>
    </el-button>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Notification from '~/src/renderer/components/molecules/Notification'
import scrollTop from '../../utils/scroll'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'notifications',
  components: { Notification },
  mixins: [reloadable],
  data () {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      backgroundColor: state => state.App.theme.background_color,
      notifications: state => state.TimelineSpace.Contents.Notifications.notifications,
      lazyLoading: state => state.TimelineSpace.Contents.Notifications.lazyLoading,
      heading: state => state.TimelineSpace.Contents.Notifications.heading,
      unread: state => state.TimelineSpace.Contents.Notifications.unreadNotifications,
      filter: state => state.TimelineSpace.Contents.Notifications.filter
    }),
    ...mapGetters('TimelineSpace/Modals', [
      'modalOpened'
    ]),
    shortcutEnabled: function () {
      if (this.modalOpened) {
        return false
      }
      if (!this.focusedId) {
        return true
      }
      // Sometimes notifications are deleted, so perhaps focused notification don't exist.
      const currentIndex = this.notifications.findIndex(notification => this.focusedId === notification.id)
      return currentIndex === -1
    }
  },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)

    Event.$on('focus-timeline', () => {
      // If focusedId does not change, we have to refresh focusedId because Toot component watch change events.
      const previousFocusedId = this.focusedId
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = previousFocusedId
      })
    })
  },
  beforeUpdate () {
    if (this.$store.state.TimelineSpace.SideMenu.unreadNotifications) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    }
  },
  beforeDestroy () {
    Event.$off('focus-timeline')
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Notifications/mergeNotifications')
    this.$store.commit('TimelineSpace/Contents/Notifications/archiveNotifications')
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  watch: {
    startReload: function (newState, oldState) {
      if (!oldState && newState) {
        this.reload()
          .finally(() => {
            this.$store.commit('TimelineSpace/HeaderMenu/changeReload', false)
          })
      }
    },
    focusedId: function (newState, _oldState) {
      if (newState >= 0 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Notifications/mergeNotifications')
        this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
      }
    }
  },
  methods: {
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('notifications').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Notifications/lazyFetchNotifications', this.notifications[this.notifications.length - 1])
          .catch(() => {
            this.$message({
              message: this.$t('message.notification_fetch_error'),
              type: 'error'
            })
          })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Notifications/mergeNotifications')
        this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
      }
    },
    async reload () {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        await this.reloadable()
        this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
      } finally {
        this.$store.commit('TimelineSpace/changeLoading', false)
      }
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Notifications/updateToot', message)
    },
    upper () {
      scrollTop(
        document.getElementById('scrollable'),
        0
      )
      this.focusedId = null
    },
    focusNext () {
      const currentIndex = this.notifications.findIndex(notification => this.focusedId === notification.id)
      if (currentIndex === -1) {
        this.focusedId = this.notifications[0].id
      } else if (currentIndex < this.notifications.length) {
        this.focusedId = this.notifications[currentIndex + 1].id
      }
    },
    focusPrev () {
      const currentIndex = this.notifications.findIndex(notification => this.focusedId === notification.id)
      if (currentIndex === 0) {
        this.focusedId = null
      } else if (currentIndex > 0) {
        this.focusedId = this.notifications[currentIndex - 1].id
      }
    },
    focusNotification (notification) {
      this.focusedId = notification.id
    },
    focusSidebar () {
      Event.$emit('focus-sidebar')
    },
    handleKey (event) {
      switch (event.srcKey) {
        case 'next':
          this.focusedId = this.notifications[0].id
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#notifications {
  .unread {
    position: fixed;
    right: 24px;
    top: 48px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 0 0 2px 2px;

    &:empty {
      display: none;
    }
  }

  .loading-card {
    height: 60px;
  }

  .loading-card:empty {
    height: 0;
  }

  .upper {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }

  .upper-with-side-bar {
    position: fixed;
    bottom: 20px;
    right: calc(20px + 360px);
  }
}
</style>
<style src="@/assets/timeline-transition.scss"></style>
