<template>
  <div id="local" v-shortkey="shortcutEnabled ? { next: ['j'] } : {}" @shortkey="handleKey">
    <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
    <div v-shortkey="{ linux: ['ctrl', 'r'], mac: ['meta', 'r'] }" @shortkey="reload()"></div>
    <transition-group name="timeline" tag="div">
      <div class="local-timeline" v-for="message in timeline" :key="message.uri + message.id">
        <toot
          :message="message"
          :filter="filter"
          :focused="message.uri + message.id === focusedId"
          :overlaid="modalOpened"
          v-on:update="updateToot"
          v-on:delete="deleteToot"
          @focusNext="focusNext"
          @focusPrev="focusPrev"
          @focusRight="focusSidebar"
          @selectToot="focusToot(message)"
        >
        </toot>
      </div>
    </transition-group>
    <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
    <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
      <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle> </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Toot from '~/src/renderer/components/organisms/Toot'
import scrollTop from '../../utils/scroll'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'local',
  components: { Toot },
  mixins: [reloadable],
  data() {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState('TimelineSpace/Contents/Local', {
      timeline: state => state.timeline,
      lazyLoading: state => state.lazyLoading,
      heading: state => state.heading,
      unread: state => state.unreadTimeline,
      filter: state => state.filter
    }),
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      unreadNotification: state => state.TimelineSpace.unreadNotification
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
    shortcutEnabled: function() {
      if (this.modalOpened) {
        return false
      }
      if (!this.focusedId) {
        return true
      }
      // Sometimes toots are deleted, so perhaps focused toot don't exist.
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      return currentIndex === -1
    }
  },
  async mounted() {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', false)
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
    if (!this.unreadNotification.local) {
      this.$store.commit('TimelineSpace/Contents/changeLoading', true)
      await this.initialize().finally(_ => {
        this.$store.commit('TimelineSpace/Contents/changeLoading', false)
      })
    }

    Event.$on('focus-timeline', () => {
      // If focusedId does not change, we have to refresh focusedId because Toot component watch change events.
      const previousFocusedId = this.focusedId
      this.focusedId = 0
      this.$nextTick(function() {
        this.focusedId = previousFocusedId
      })
    })
  },
  beforeUpdate() {
    if (this.$store.state.TimelineSpace.SideMenu.unreadLocalTimeline && this.heading) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', false)
    }
  },
  beforeDestroy() {
    if (!this.unreadNotification.local) {
      this.$store.dispatch('TimelineSpace/stopLocalStreaming')
      this.$store.dispatch('TimelineSpace/unbindLocalStreaming')
    }
    Event.$off('focus-timeline')
  },
  destroyed() {
    this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Local/mergeTimeline')
    this.$store.commit('TimelineSpace/Contents/Local/archiveTimeline')
    if (!this.unreadNotification.local) {
      this.$store.commit('TimelineSpace/Contents/Local/clearTimeline')
    }
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  watch: {
    startReload: function(newState, oldState) {
      if (!oldState && newState) {
        this.reload().finally(() => {
          this.$store.commit('TimelineSpace/HeaderMenu/changeReload', false)
        })
      }
    },
    focusedId: function(newState, _oldState) {
      if (newState && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Local/mergeTimeline')
      }
    }
  },
  methods: {
    async initialize() {
      await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline').catch(_ => {
        this.$message({
          message: this.$t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
      await this.$store.dispatch('TimelineSpace/bindLocalStreaming')
      this.$store.dispatch('TimelineSpace/startLocalStreaming')
    },
    updateToot(message) {
      this.$store.commit('TimelineSpace/Contents/Local/updateToot', message)
    },
    deleteToot(message) {
      this.$store.commit('TimelineSpace/Contents/Local/deleteToot', message.id)
    },
    onScroll(event) {
      if (event.target.clientHeight + event.target.scrollTop >= document.getElementById('local').clientHeight - 10 && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Local/lazyFetchTimeline', this.timeline[this.timeline.length - 1]).catch(() => {
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
      }
      // for unread control
      if (event.target.scrollTop > 10 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', false)
      } else if (event.target.scrollTop <= 10 && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Local/mergeTimeline')
      }
    },
    async reload() {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        await this.reloadable()
      } finally {
        this.$store.commit('TimelineSpace/changeLoading', false)
      }
    },
    upper() {
      scrollTop(document.getElementById('scrollable'), 0)
      this.focusedId = null
    },
    focusNext() {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex === -1) {
        this.focusedId = this.timeline[0].uri + this.timeline[0].id
      } else if (currentIndex < this.timeline.length) {
        this.focusedId = this.timeline[currentIndex + 1].uri + this.timeline[currentIndex + 1].id
      }
    },
    focusPrev() {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex === 0) {
        this.focusedId = null
      } else if (currentIndex > 0) {
        this.focusedId = this.timeline[currentIndex - 1].uri + this.timeline[currentIndex - 1].id
      }
    },
    focusToot(message) {
      this.focusedId = message.uri + message.id
    },
    focusSidebar() {
      Event.$emit('focus-sidebar')
    },
    handleKey(event) {
      switch (event.srcKey) {
        case 'next':
          this.focusedId = this.timeline[0].uri + this.timeline[0].id
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#local {
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
    right: calc(20px + var(--current-sidebar-width));
    transition: all 0.5s;
  }
}
</style>
<style src="@/assets/timeline-transition.scss"></style>
