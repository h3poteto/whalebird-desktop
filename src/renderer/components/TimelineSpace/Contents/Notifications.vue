<template>
  <div id="notifications" v-shortkey="shortcutEnabled ? { next: ['j'] } : {}" @shortkey="handleKey">
    <div v-shortkey="{ linux: ['ctrl', 'r'], mac: ['meta', 'r'] }" @shortkey="reload()"></div>
    <DynamicScroller :items="handledNotifications" :min-item-size="20" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.url]" :data-index="index" :watchData="true">
          <notification
            :message="item"
            :focused="item.id === focusedId"
            :overlaid="modalOpened"
            :filters="filters"
            v-on:update="updateToot"
            @focusNext="focusNext"
            @focusPrev="focusPrev"
            @focusRight="focusSidebar"
            @selectNotification="focusNotification(item)"
          >
          </notification>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
      <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle> </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Notification from '~/src/renderer/components/organisms/Notification'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'
import { ScrollPosition } from '~/src/renderer/components/utils/scroll'

export default {
  name: 'notifications',
  components: { Notification },
  mixins: [reloadable],
  data() {
    return {
      focusedId: null,
      scroll: null,
      observer: null
    }
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      backgroundColor: state => state.App.theme.background_color
    }),
    ...mapState('TimelineSpace/Contents/Notifications', {
      lazyLoading: state => state.lazyLoading,
      heading: state => state.heading
    }),
    ...mapGetters('TimelineSpace/Contents/Notifications', ['handledNotifications', 'filters']),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
    shortcutEnabled: function () {
      if (this.modalOpened) {
        return false
      }
      if (!this.focusedId) {
        return true
      }
      // Sometimes notifications are deleted, so perhaps focused notification don't exist.
      const currentIndex = this.handledNotifications.findIndex(notification => this.focusedId === notification.id)
      return currentIndex === -1
    }
  },
  mounted() {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
    document.getElementById('scroller').addEventListener('scroll', this.onScroll)

    Event.$on('focus-timeline', () => {
      // If focusedId does not change, we have to refresh focusedId because Toot component watch change events.
      const previousFocusedId = this.focusedId
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = previousFocusedId
      })
    })

    if (this.heading && this.handledNotifications.length > 0) {
      this.$store.dispatch('TimelineSpace/Contents/Notifications/saveMarker', this.handledNotifications[0].id)
    }
    const el = document.getElementById('scroller')
    this.scroll = new ScrollPosition(el)
    this.scroll.prepare()

    this.observer = new ResizeObserver(() => {
      if (this.scroll && !this.heading && !this.lazyLoading) {
        this.scroll.restore()
      }
    })

    const scrollWrapper = el.getElementsByClassName('vue-recycle-scroller__item-wrapper')[0]
    this.observer.observe(scrollWrapper)
  },
  beforeUpdate() {
    if (this.$store.state.TimelineSpace.SideMenu.unreadNotifications && this.heading) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadNotifications', false)
    }
    this.scroll.prepare()
  },
  beforeDestroy() {
    Event.$off('focus-timeline')
    this.observer.disconnect()
  },
  destroyed() {
    this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Notifications/archiveNotifications')
    if (document.getElementById('scroller') !== undefined && document.getElementById('scroller') !== null) {
      document.getElementById('scroller').removeEventListener('scroll', this.onScroll)
      document.getElementById('scroller').scrollTop = 0
    }
  },
  watch: {
    startReload: function (newState, oldState) {
      if (!oldState && newState) {
        this.reload().finally(() => {
          this.$store.commit('TimelineSpace/HeaderMenu/changeReload', false)
        })
      }
    },
    focusedId: function (newState, _oldState) {
      if (newState >= 0 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', true)
        this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
      }
    },
    handledNotifications: function (newState, _oldState) {
      if (this.heading && newState.length > 0) {
        this.$store.dispatch('TimelineSpace/Contents/Notifications/saveMarker', newState[0].id)
      }
    }
  },
  methods: {
    onScroll(event) {
      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('scroller').scrollHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store
          .dispatch(
            'TimelineSpace/Contents/Notifications/lazyFetchNotifications',
            this.handledNotifications[this.handledNotifications.length - 1]
          )
          .catch(() => {
            this.$message({
              message: this.$t('message.notification_fetch_error'),
              type: 'error'
            })
          })
      }

      if (event.target.scrollTop > 10 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', false)
      } else if (event.target.scrollTop <= 10 && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Notifications/changeHeading', true)
        this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
      }
    },
    async reload() {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        await this.reloadable()
        this.$store.dispatch('TimelineSpace/Contents/Notifications/resetBadge')
      } finally {
        this.$store.commit('TimelineSpace/changeLoading', false)
      }
    },
    updateToot(message) {
      this.$store.commit('TimelineSpace/Contents/Notifications/updateToot', message)
    },
    upper() {
      this.$refs.scroller.scrollToItem(0)
      this.focusedId = null
    },
    focusNext() {
      const currentIndex = this.handledNotifications.findIndex(notification => this.focusedId === notification.id)
      if (currentIndex === -1) {
        this.focusedId = this.handledNotifications[0].id
      } else if (currentIndex < this.handledNotifications.length) {
        this.focusedId = this.handledNotifications[currentIndex + 1].id
      }
    },
    focusPrev() {
      const currentIndex = this.handledNotifications.findIndex(notification => this.focusedId === notification.id)
      if (currentIndex === 0) {
        this.focusedId = null
      } else if (currentIndex > 0) {
        this.focusedId = this.handledNotifications[currentIndex - 1].id
      }
    },
    focusNotification(notification) {
      this.focusedId = notification.id
    },
    focusSidebar() {
      Event.$emit('focus-sidebar')
    },
    handleKey(event) {
      switch (event.srcKey) {
        case 'next':
          this.focusedId = this.handledNotifications[0].id
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#notifications {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
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
    right: calc(20px + var(--current-sidebar-width));
    transition: all 0.5s;
  }
}
</style>
<style lang="scss" src="@/assets/timeline-transition.scss"></style>
