<template>
<div id="notifications" v-shortkey="{next: ['j']}" @shortkey="handleKey">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <transition-group name="timeline" tag="div">
    <div class="notifications" v-for="(message, index) in notifications" v-bind:key="message.id">
      <notification
        :message="message"
        :filter="filter"
        :focused="index === focusedIndex"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @selectNotification="focusNotification(index)"
        >
      </notification>
    </div>
  </transition-group>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor">
  </div>
  <div class="upper" v-show="!heading">
    <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle>
    </el-button>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Notification from './Cards/Notification'
import scrollTop from '../../utils/scroll'

export default {
  name: 'notifications',
  components: { Notification },
  data () {
    return {
      focusedIndex: null
    }
  },
  computed: {
    ...mapState({
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      backgroundColor: state => state.App.theme.background_color,
      notifications: state => state.TimelineSpace.Contents.Notifications.notifications,
      lazyLoading: state => state.TimelineSpace.Contents.Notifications.lazyLoading,
      heading: state => state.TimelineSpace.Contents.Notifications.heading,
      unread: state => state.TimelineSpace.Contents.Notifications.unreadNotifications,
      filter: state => state.TimelineSpace.Contents.Notifications.filter
    })
  },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  beforeUpdate () {
    if (this.$store.state.TimelineSpace.SideMenu.unreadNotifications) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    }
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
    focusedIndex: function (newState, oldState) {
      if (newState >= 0 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Notifications/mergeNotifications')
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
      }
    },
    async reload () {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        const account = await this.$store.dispatch('TimelineSpace/localAccount', this.$route.params.id).catch((err) => {
          this.$message({
            message: this.$t('message.account_load_error'),
            type: 'error'
          })
          throw err
        })
        await this.$store.dispatch('TimelineSpace/stopUserStreaming')
        await this.$store.dispatch('TimelineSpace/stopLocalStreaming')

        await this.$store.dispatch('TimelineSpace/Contents/Home/fetchTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Notifications/fetchNotifications', account)
          .catch(() => {
            this.$message({
              message: this.$t('message.notification_fetch_error'),
              type: 'error'
            })
          })

        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
        this.$store.dispatch('TimelineSpace/startLocalStreaming', account)
      } finally {
        this.$store.commit('TimelineSpace/changeLoading', false)
      }
    },
    upper () {
      scrollTop(
        document.getElementById('scrollable'),
        0
      )
      this.focusedIndex = null
    },
    focusNext () {
      if (this.focusedIndex === null) {
        this.focusedIndex = 0
      } else if (this.focusedIndex < this.notifications.length) {
        this.focusedIndex++
      }
    },
    focusPrev () {
      if (this.focusedIndex === 0) {
        this.focusedIndex = null
      } else if (this.focusedIndex > 0) {
        this.focusedIndex--
      }
    },
    focusNotification (index) {
      this.focusedIndex = index
    },
    handleKey (event) {
      switch (event.srcKey) {
        case 'next':
          if (!this.focusedIndex) {
            this.focusedIndex = 0
          }
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
}
</style>
<style src="@/assets/timeline-transition.scss"></style>
