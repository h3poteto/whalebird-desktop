<template>
<div name="list" v-shortkey="shortcutEnabled ? {next:['j']} : {}" @shortkey="handleKey">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <transition-group name="timeline" tag="div">
    <div class="list-timeline" v-for="message in timeline" v-bind:key="message.uri + message.id">
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
        >
      </toot>
    </div>
  </transition-group>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
  <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
    <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle>
    </el-button>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Toot from '~/src/renderer/components/molecules/Toot'
import scrollTop from '../../../utils/scroll'
import reloadable from '~/src/renderer/components/mixins/reloadable'

export default {
  name: 'list',
  props: ['list_id'],
  components: { Toot },
  mixins: [reloadable],
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
      timeline: state => state.TimelineSpace.Contents.Lists.Show.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Lists.Show.lazyLoading,
      heading: state => state.TimelineSpace.Contents.Lists.Show.heading,
      unread: state => state.TimelineSpace.Contents.Lists.Show.unreadTimeline,
      filter: state => state.TimelineSpace.Contents.Lists.Show.filter
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
  created () {
    this.$store.commit('TimelineSpace/changeLoading', true)
    this.load()
      .finally(() => {
        this.$store.commit('TimelineSpace/changeLoading', false)
      })
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  watch: {
    list_id: function () {
      this.$store.commit('TimelineSpace/changeLoading', true)
      this.load()
        .finally(() => {
          this.$store.commit('TimelineSpace/changeLoading', false)
        })
    },
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
        this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Lists/Show/mergeTimeline')
      }
    }
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Contents/Lists/Show/stopStreaming')
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Lists/Show/mergeTimeline')
    this.$store.commit('TimelineSpace/Contents/Lists/Show/archiveTimeline')
    this.$store.commit('TimelineSpace/Contents/Lists/Show/clearTimeline')
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  methods: {
    async load () {
      await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/stopStreaming')
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/fetchTimeline', this.list_id)
      } catch (err) {
        this.$message({
          message: this.$t('message.timeline_fetch_error'),
          type: 'error'
        })
      }
      this.$store.dispatch('TimelineSpace/Contents/Lists/Show/startStreaming', this.list_id)
        .catch(() => {
          this.$message({
            message: this.$t('message.start_streaming_error'),
            type: 'error'
          })
        })
      return 'started'
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Lists/Show/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/Lists/Show/deleteToot', message)
    },
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementsByName('list')[0].clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Lists/Show/lazyFetchTimeline', {
          list_id: this.list_id,
          last: this.timeline[this.timeline.length - 1]
        })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Lists/Show/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Lists/Show/mergeTimeline')
      }
    },
    async reload () {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        await this.reloadable()
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/stopStreaming')
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Show/fetchTimeline', this.list_id)
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
        this.$store.dispatch('TimelineSpace/Contents/Lists/Show/startStreaming', this.list_id)
          .catch(() => {
            this.$message({
              message: this.$t('message.start_streaming_error'),
              type: 'error'
            })
          })
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
  right: -webkit-calc(20px + 320px);
}
</style>
<style src="@/assets/timeline-transition.scss"></style>
