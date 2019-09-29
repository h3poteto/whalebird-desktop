<template>
  <div name="tag" v-shortkey="shortcutEnabled ? { next: ['j'] } : {}" @shortkey="handleKey">
    <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
    <div v-shortkey="{ linux: ['ctrl', 'r'], mac: ['meta', 'r'] }" @shortkey="reload()"></div>
    <transition-group name="timeline" tag="div">
      <div class="tag-timeline" v-for="message in timeline" v-bind:key="message.uri + message.id">
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
import scrollTop from '../../../utils/scroll'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'tag',
  components: { Toot },
  mixins: [reloadable],
  props: ['tag'],
  data() {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      timeline: state => state.TimelineSpace.Contents.Hashtag.Tag.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Hashtag.Tag.lazyLoading,
      heading: state => state.TimelineSpace.Contents.Hashtag.Tag.heading,
      unread: state => state.TimelineSpace.Contents.Hashtag.Tag.unreadTimeline,
      filter: state => state.TimelineSpace.Contents.Hashtag.Tag.filter
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
  mounted() {
    this.$store.commit('TimelineSpace/Contents/changeLoading', true)
    this.load(this.tag).finally(() => {
      this.$store.commit('TimelineSpace/Contents/changeLoading', false)
    })
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)

    Event.$on('focus-timeline', () => {
      // If focusedId does not change, we have to refresh focusedId because Toot component watch change events.
      const previousFocusedId = this.focusedId
      this.focusedId = 0
      this.$nextTick(function() {
        this.focusedId = previousFocusedId
      })
    })
  },
  watch: {
    tag: function(newTag, _oldTag) {
      this.$store.commit('TimelineSpace/Contents/changeLoading', true)
      this.reset()
      this.load(newTag).finally(() => {
        this.$store.commit('TimelineSpace/Contents/changeLoading', false)
      })
    },
    startReload: function(newState, oldState) {
      if (!oldState && newState) {
        this.reload().finally(() => {
          this.$store.commit('TimelineSpace/HeaderMenu/changeReload', false)
        })
      }
    },
    focusedId: function(newState, _oldState) {
      if (newState && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/mergeTimeline')
      }
    }
  },
  beforeDestroy() {
    this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/stopStreaming')
    this.reset()
    Event.$off('focus-timeline')
  },
  methods: {
    async load(tag) {
      await this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/fetch', tag).catch(() => {
        this.$message({
          message: this.$t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
      this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/startStreaming', tag).catch(() => {
        this.$message({
          message: this.$t('message.start_streaming_error'),
          type: 'error'
        })
      })
      return true
    },
    reset() {
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', true)
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/mergeTimeline')
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/archiveTimeline')
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/clearTimeline')
      if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
        document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
        document.getElementById('scrollable').scrollTop = 0
      }
    },
    updateToot(toot) {
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/updateToot', toot)
    },
    deleteToot(toot) {
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/deleteToot', toot.id)
    },
    onScroll(event) {
      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementsByName('tag')[0].clientHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/lazyFetchTimeline', {
          tag: this.tag,
          status: this.timeline[this.timeline.length - 1]
        })
      }
      // for unread control
      if (event.target.scrollTop > 10 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', false)
      } else if (event.target.scrollTop <= 10 && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/mergeTimeline')
      }
    },
    async reload() {
      const tag = this.tag
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        await this.reloadable()
        await this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/stopStreaming')
        await this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/fetch', tag).catch(() => {
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
        this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/startStreaming', tag).catch(() => {
          this.$message({
            message: this.$t('message.start_streaming_error'),
            type: 'error'
          })
        })
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
</style>
<style src="@/assets/timeline-transition.scss"></style>
