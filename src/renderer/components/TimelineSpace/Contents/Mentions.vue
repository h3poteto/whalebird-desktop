<template>
<div id="mentions" v-shortkey="shortcutEnabled ? {next: ['j']} : {}" @shortkey="handleKey">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <transition-group name="timeline" tag="div">
    <div class="mentions" v-for="message in mentions" :key="message.id">
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
import Notification from '~/src/renderer/components/organisms/Notification'
import scrollTop from '../../utils/scroll'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'mentions',
  components: { Notification },
  mixins: [reloadable],
  data () {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState('App', {
      backgroundColor: state => state.theme.background_color
    }),
    ...mapState('TimelineSpace/HeaderMenu', {
      startReload: state => state.reload
    }),
    ...mapState('TimelineSpace/Contents/SideBar', {
      openSideBar: state => state.openSideBar
    }),
    ...mapState('TimelineSpace/Contents/Mentions', {
      lazyLoading: state => state.lazyLoading,
      heading: state => state.heading,
      unread: state => state.unreadMentions,
      filter: state => state.filter
    }),
    ...mapGetters('TimelineSpace/Modals', [
      'modalOpened'
    ]),
    ...mapGetters('TimelineSpace/Contents/Mentions', [
      'mentions'
    ]),
    shortcutEnabled: function () {
      if (this.modalOpened) {
        return false
      }
      if (!this.focusedId) {
        return true
      }
      // Sometimes toots are deleted, so perhaps focused toot don't exist.
      const currentIndex = this.mentions.findIndex(toot => this.focusedId === toot.id)
      return currentIndex === -1
    }
  },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadMentions', false)
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
    if (this.$store.state.TimelineSpace.SideMenu.unreadMentions && this.heading) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadMentions', false)
    }
  },
  beforeDestroy () {
    Event.$off('focus-timeline')
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Mentions/mergeMentions')
    this.$store.commit('TimelineSpace/Contents/Mentions/archiveMentions')
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
      if (newState && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Mentions/mergeMentions')
      }
    }
  },
  methods: {
    onScroll (event) {
      // for lazyLoading
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('mentions').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Mentions/lazyFetchMentions', this.mentions[this.mentions.length - 1])
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Mentions/mergeMentions')
      }
    },
    async reload () {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        await this.reloadable()
      } finally {
        this.$store.commit('TimelineSpace/changeLoading', false)
      }
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Mentions/updateToot', message)
    },
    upper () {
      scrollTop(
        document.getElementById('scrollable'),
        0
      )
      this.focusedId = null
    },
    focusNext () {
      const currentIndex = this.mentions.findIndex(toot => this.focusedId === toot.id)
      if (currentIndex === -1) {
        this.focusedId = this.mentions[0].id
      } else if (currentIndex < this.mentions.length) {
        this.focusedId = this.mentions[currentIndex + 1].id
      }
    },
    focusPrev () {
      const currentIndex = this.mentions.findIndex(toot => this.focusedId === toot.id)
      if (currentIndex === 0) {
        this.focusedId = null
      } else if (currentIndex > 0) {
        this.focusedId = this.mentions[currentIndex - 1].id
      }
    },
    focusNotification (message) {
      this.focusedId = message.id
    },
    focusSidebar () {
      Event.$emit('focus-sidebar')
    },
    handleKey (event) {
      switch (event.srcKey) {
        case 'next':
          this.focusedId = this.mentions[0].id
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#mentions {
  .unread {
    position: fixed;
    right: 24px;
    top: 48px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
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
