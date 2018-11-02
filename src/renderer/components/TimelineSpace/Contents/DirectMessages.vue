<template>
<div id="directmessages" v-shortkey="shortcutEnabled ? {next: ['j']} : {}" @shortkey="handleKey">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <transition-group name="timeline" tag="div">
    <toot
      :message="message"
      :filter="filter"
      :focused="message.uri + message.id === focusedId"
      :overlaid="modalOpened"
      v-on:update="updateToot"
      v-on:delete="deleteToot"
      @focusNext="focusNext"
      @focusPrev="focusPrev"
      @selectToot="focusToot(message)"
      v-for="message in timeline"
      :key="message.uri + message.id"
      >
    </toot>
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
import Toot from './Cards/Toot'
import scrollTop from '../../utils/scroll'

export default {
  name: 'directmessages',
  components: { Toot },
  data () {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      timeline: state => state.TimelineSpace.Contents.DirectMessages.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.DirectMessages.lazyLoading,
      heading: state => state.TimelineSpace.Contents.DirectMessages.heading,
      unread: state => state.TimelineSpace.Contents.DirectMessages.unreadTimeline,
      filter: state => state.TimelineSpace.Contents.DirectMessages.filter
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
      // Sometimes toots are deleted, so perhaps focused toot don't exist.
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      return currentIndex === -1
    }
  },
  mounted () {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadDirectMessagesTimeline', false)
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  beforeUpdate () {
    if (this.$store.state.TimelineSpace.SideMenu.unreadDirectMessagesTimeline && this.heading) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadDirectMessagesTimeline', false)
    }
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/DirectMessages/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/DirectMessages/mergeTimeline')
    this.$store.commit('TimelineSpace/Contents/DirectMessages/archiveTimeline')
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
    focusedId: function (newState, oldState) {
      if (newState && this.heading) {
        this.$store.commit('TimelineSpace/Contents/DirectMessages/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/DirectMessages/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/DirectMessages/mergeTimeline')
      }
    }
  },
  methods: {
    onScroll (event) {
      // for lazyLoading
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('directmessages').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/DirectMessages/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/DirectMessages/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/DirectMessages/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/DirectMessages/mergeTimeline')
      }
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/DirectMessages/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/DirectMessages/deleteToot', message)
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

        await this.$store.dispatch('TimelineSpace/Contents/DirectMessages/fetchTimeline', account)
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
        await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)

        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
          .catch(() => {
            this.$message({
              message: this.$t('message.start_streaming_error'),
              type: 'error'
            })
          })
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
      this.focusedId = null
    },
    focusNext () {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex === -1) {
        this.focusedId = this.timeline[0].uri + this.timeline[0].id
      } else if (currentIndex < this.timeline.length) {
        this.focusedId = this.timeline[currentIndex + 1].uri + this.timeline[currentIndex + 1].id
      }
    },
    focusPrev () {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex === 0) {
        this.focusedId = null
      } else if (currentIndex > 0) {
        this.focusedId = this.timeline[currentIndex - 1].uri + this.timeline[currentIndex - 1].id
      }
    },
    focusToot (message) {
      this.focusedId = message.uri + message.id
    },
    handleKey (event) {
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
#directmessages {
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
    transition: all 0.5s;
  }

  .upper-with-side-bar {
    position: fixed;
    bottom: 20px;
    right: -webkit-calc(20px + 320px);
    transition: all 0.5s;
  }
}
</style>
<style src="@/assets/timeline-transition.scss"></style>
