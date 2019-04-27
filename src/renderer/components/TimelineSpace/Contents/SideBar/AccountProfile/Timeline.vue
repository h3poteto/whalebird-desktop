<template>
<div id="account_timeline">
  <template v-for="message in pinnedToots">
    <toot
      :message="message"
      :key="message.id"
      :focused="message.uri + message.id === focusedId"
      :pinned="true"
      :overlaid="modalOpened"
      v-on:update="updatePinnedToot"
      v-on:delete="deleteToot"
      @focusNext="focusNext"
      @focusPrev="focusPrev"
      @focusLeft="focusTimeline"
      @selectToot="focusToot(message)"
      >
    </toot>
  </template>
  <template v-for="message in timeline">
    <toot
      :message="message"
      :key="message.id"
      :focused="message.uri + message.id === focusedId"
      :overlaid="modalOpened"
      v-on:update="updateToot"
      v-on:delete="deleteToot"
      @focusNext="focusNext"
      @focusPrev="focusPrev"
      @focusLeft="focusTimeline"
      @selectToot="focusToot(message)"
      >
    </toot>
  </template>
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor">
  </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Toot from '~/src/renderer/components/molecules/Toot'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'timeline',
  props: [ 'account' ],
  components: { Toot },
  data () {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState('TimelineSpace/Contents/SideBar/AccountProfile/Timeline', {
      timeline: state => state.timeline,
      pinnedToots: state => state.pinnedToots,
      lazyLoading: state => state.lazyLoading
    }),
    ...mapState('App', {
      backgroundColor: state => state.theme.background_color
    }),
    ...mapGetters('TimelineSpace/Modals', [
      'modalOpened'
    ])
  },
  created () {
    this.load()
  },
  mounted () {
    this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/clearTimeline')
    document.getElementById('sidebar_scrollable').addEventListener('scroll', this.onScroll)
    Event.$on('focus-sidebar', () => {
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = this.timeline[0].uri + this.timeline[0].id
      })
    })
  },
  beforeDestroy () {
    Event.$emit('focus-timeline')
    Event.$off('focus-sidebar')
  },
  destroyed () {
    if (document.getElementById('sidebar_scrollable') !== undefined && document.getElementById('sidebar_scrollable') !== null) {
      document.getElementById('sidebar_scrollable').removeEventListener('scroll', this.onScroll)
    }
  },
  watch: {
    account: function (_newAccount, _oldAccount) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/clearTimeline')
      this.load()
    }
  },
  methods: {
    load () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/fetchTimeline', this.account)
        .catch(() => {
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
    },
    onScroll (event) {
      // for lazyLoading
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('account_profile').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch(
          'TimelineSpace/Contents/SideBar/AccountProfile/Timeline/lazyFetchTimeline',
          {
            account: this.account,
            last: this.timeline[this.timeline.length - 1]
          })
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }
    },
    updatePinnedToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/updatePinnedToot', message)
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/deleteToot', message)
    },
    focusNext () {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex === -1) {
        this.focusedId = this.timeline[0].uri + this.timeline[0].id
      } else if (currentIndex < this.timeline.length - 1) {
        this.focusedId = this.timeline[currentIndex + 1].uri + this.timeline[currentIndex + 1].id
      }
    },
    focusPrev () {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex > 0) {
        this.focusedId = this.timeline[currentIndex - 1].uri + this.timeline[currentIndex - 1].id
      }
    },
    focusToot (message) {
      this.focusedId = message.uri + message.id
    },
    focusTimeline () {
      this.focusedId = 0
      Event.$emit('focus-timeline')
    }
  }
}
</script>

<style lang="scss" scoped>
  .loading-card {
    height: 60px;
  }

  .loading-card:empty {
    height: 0;
  }
</style>
