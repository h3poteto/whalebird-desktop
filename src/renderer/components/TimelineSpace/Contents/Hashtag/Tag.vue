<template>
<div name="tag">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <transition-group name="timeline" tag="div">
    <div class="tag-timeline" v-for="(message, index) in timeline" v-bind:key="message.uri">
      <toot
        :message="message"
        :filter="filter"
        :focused="index === focusedIndex"
        v-on:update="updateToot"
        v-on:delete="deleteToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @selectToot="focusToot(index)"
        >
      </toot>
    </div>
  </transition-group>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
  <div class="upper" v-show="!heading">
    <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle>
    </el-button>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '../Cards/Toot'
import scrollTop from '../../../utils/scroll'

export default {
  name: 'tag',
  components: { Toot },
  props: ['tag'],
  data () {
    return {
      focusedIndex: null
    }
  },
  computed: {
    ...mapState({
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      timeline: state => state.TimelineSpace.Contents.Hashtag.Tag.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Hashtag.Tag.lazyLoading,
      heading: state => state.TimelineSpace.Contents.Hashtag.Tag.heading,
      unread: state => state.TimelineSpace.Contents.Hashtag.Tag.unreadTimeline,
      filter: state => state.TimelineSpace.Contents.Hashtag.Tag.filter
    })
  },
  mounted () {
    this.$store.commit('TimelineSpace/changeLoading', true)
    this.load(this.tag)
      .finally(() => {
        this.$store.commit('TimelineSpace/changeLoading', false)
      })
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  watch: {
    tag: function (newTag, oldTag) {
      this.$store.commit('TimelineSpace/changeLoading', true)
      this.reset()
      this.load(newTag)
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
    focusedIndex: function (newState, oldState) {
      if (newState >= 0 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/mergeTimeline')
      }
    }
  },
  beforeDestroy () {
    this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/stopStreaming')
    this.reset()
  },
  methods: {
    async load (tag) {
      this.$store.commit('TimelineSpace/SideMenu/updateOverrideActivePath', `/${this.$route.params.id}/hashtag`)

      await this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/fetch', tag)
        .catch(() => {
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
      this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/startStreaming', tag)
        .catch(() => {
          this.$message({
            message: this.$t('message.start_streaming_error'),
            type: 'error'
          })
        })
      return true
    },
    reset () {
      this.$store.commit('TimelineSpace/SideMenu/updateOverrideActivePath', null)
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', true)
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/mergeTimeline')
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/archiveTimeline')
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/clearTimeline')
      if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
        document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
        document.getElementById('scrollable').scrollTop = 0
      }
    },
    updateToot (toot) {
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/updateToot', toot)
    },
    deleteToot (toot) {
      this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/deleteToot', toot)
    },
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementsByName('tag')[0].clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/lazyFetchTimeline', {
          tag: this.tag,
          last: this.timeline[this.timeline.length - 1]
        })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/mergeTimeline')
        this.focusedIndex = null
      }
    },
    async reload () {
      const tag = this.tag
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
        await this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/stopStreaming')

        await this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/fetchTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/fetch', tag)
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })

        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
        this.$store.dispatch('TimelineSpace/startLocalStreaming', account)
        this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/startStreaming', tag)
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
      this.focusedIndex = null
    },
    focusNext () {
      if (this.focusedIndex === null) {
        this.focusedIndex = 0
      } else if (this.focusedIndex < this.timeline.length) {
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
    focusToot (index) {
      this.focusedIndex = index
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
</style>
<style src="@/assets/timeline-transition.scss"></style>
