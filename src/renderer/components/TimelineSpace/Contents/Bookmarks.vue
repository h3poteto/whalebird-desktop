<template>
  <div id="bookmarks" v-shortkey="shortcutEnabled ? { next: ['j'] } : {}" @shortkey="handleKey">
    <div v-shortkey="{ linux: ['ctrl', 'r'], mac: ['meta', 'r'] }" @shortkey="reload()"></div>
    <div class="bookmark" v-for="message in bookmarks" v-bind:key="message.id">
      <toot
        :message="message"
        :focused="message.uri === focusedId"
        :overlaid="modalOpened"
        v-on:update="updateToot"
        v-on:delete="deleteToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusRight="focusSidebar"
        @selectToot="focusToot(message)"
      ></toot>
    </div>
    <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
    <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
      <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle> </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import scrollTop from '@/components/utils/scroll'
import Toot from '@/components/organisms/Toot'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'bookmarks',
  components: { Toot },
  mixins: [reloadable],
  data() {
    return {
      heading: true,
      focusedId: null
    }
  },
  computed: {
    ...mapState('TimelineSpace', {
      account: state => state.account
    }),
    ...mapState('App', {
      backgroundColor: state => state.theme.background_color
    }),
    ...mapState('TimelineSpace/HeaderMenu', {
      startReload: state => state.reload
    }),
    ...mapState('TimelineSpace/Contents/SideBar', {
      openSideBar: state => state.openSideBar
    }),
    ...mapState('TimelineSpace/Contents/Bookmarks', {
      bookmarks: state => state.bookmarks,
      lazyLoading: state => state.lazyLoading,
      filter: state => state.filter
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
    shortcutEnabled: function () {
      return !this.focusedId && !this.modalOpened
    }
  },
  created() {
    this.$store.commit('TimelineSpace/Contents/changeLoading', true)
    this.$store
      .dispatch('TimelineSpace/Contents/Bookmarks/fetchBookmarks', this.account)
      .catch(() => {
        this.$message({
          message: this.$t('message.bookmark_fetch_error'),
          type: 'error'
        })
      })
      .finally(() => {
        this.$store.commit('TimelineSpace/Contents/changeLoading', false)
      })
  },
  mounted() {
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
  beforeDestroy() {
    Event.$off('focus-timeline')
  },
  destroyed() {
    this.$store.commit('TimelineSpace/Contents/Bookmarks/updateBookmarks', [])
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
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
      if (newState && this.heading) {
        this.heading = false
      } else if (newState === null && !this.heading) {
        this.heading = true
      }
    }
  },
  methods: {
    updateToot(message) {
      this.$store.commit('TimelineSpace/Contents/Bookmarks/updateToot', message)
    },
    deleteToot(message) {
      this.$store.commit('TimelineSpace/Contents/Bookmarks/deleteToot', message)
    },
    onScroll(event) {
      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('bookmarks').clientHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store.dispatch('TimelineSpace/Contents/Bookmarks/lazyFetchBookmarks', this.bookmarks[this.bookmarks.length - 1]).catch(() => {
          this.$message({
            message: this.$t('message.bookmark_fetch_error'),
            type: 'error'
          })
        })
      }
      // for upper
      if (event.target.scrollTop > 10 && this.heading) {
        this.heading = false
      } else if (event.target.scrollTop <= 10 && !this.heading) {
        this.heading = true
      }
    },
    async reload() {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        const account = await this.reloadable()
        await this.$store.dispatch('TimelineSpace/Contents/Bookmarks/fetchBookmarks', account).catch(() => {
          this.$message({
            message: this.$t('message.bookmark_fetch_error'),
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
      const currentIndex = this.bookmarks.findIndex(toot => this.focusedId === toot.uri)
      if (currentIndex === -1) {
        this.focusedId = this.bookmarks[0].uri
      } else if (currentIndex < this.bookmarks.length) {
        this.focusedId = this.bookmarks[currentIndex + 1].uri
      }
    },
    focusPrev() {
      const currentIndex = this.bookmarks.findIndex(toot => this.focusedId === toot.uri)
      if (currentIndex === 0) {
        this.focusedId = null
      } else if (currentIndex > 0) {
        this.focusedId = this.bookmarks[currentIndex - 1].uri
      }
    },
    focusToot(message) {
      this.focusedId = message.id
    },
    focusSidebar() {
      Event.$emit('focus-sidebar')
    },
    handleKey(event) {
      switch (event.srcKey) {
        case 'next':
          this.focusedId = this.bookmarks[0].uri
          break
      }
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
