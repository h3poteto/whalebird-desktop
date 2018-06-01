<template>
<div name="tag">
  <div class="unread">{{ unread.length > 0 ? unread.length : '' }}</div>
  <transition-group name="timeline" tag="div">
    <div class="tag-timeline" v-for="message in timeline" v-bind:key="message.id">
      <toot :message="message" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
    </div>
  </transition-group>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '../Cards/Toot'

export default {
  name: 'tag',
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.Contents.Hashtag.Tag.timeline,
      lazyLoading: state => state.TimelineSpace.Contents.Hashtag.Tag.lazyLoading,
      backgroundColor: state => state.App.theme.background_color,
      heading: state => state.TimelineSpace.Contents.Hashtag.Tag.heading,
      unread: state => state.TimelineSpace.Contents.Hashtag.Tag.unreadTimeline
    })
  },
  mounted () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.load(this.$route.params.tag)
      .then(() => {
        loading.close()
      })
      .catch(() => {
        loading.close()
      })
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  watch: {
    '$route': function () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.reset()
      this.load(this.$route.params.tag)
        .then(() => {
          loading.close()
        })
        .catch(() => {
          loading.close()
        })
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
            message: 'Could not fetch timeline',
            type: 'error'
          })
        })
      this.$store.dispatch('TimelineSpace/Contents/Hashtag/Tag/startStreaming', tag)
        .catch(() => {
          this.$message({
            message: 'Could not start streaming',
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
          tag: this.$route.params.tag,
          last: this.timeline[this.timeline.length - 1]
        })
      }
      // for unread control
      if ((event.target.scrollTop > 10) && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', false)
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeHeading', true)
        this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/mergeTimeline')
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
</style>
<style src="@/assets/timeline-transition.scss"></style>
