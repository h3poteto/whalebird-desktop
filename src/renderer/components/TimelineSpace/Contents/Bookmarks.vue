<template>
  <div id="bookmarks">
    <div></div>
    <DynamicScroller :items="bookmarks" :min-item-size="60" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            :message="item"
            :focused="item.uri === focusedId"
            :overlaid="modalOpened"
            :filters="[]"
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @focusNext="focusNext"
            @focusPrev="focusPrev"
            @focusRight="focusSidebar"
            @selectToot="focusToot(item)"
          ></toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
      <el-button type="primary" @click="upper" circle>
        <font-awesome-icon icon="angle-up" class="upper-icon" />
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Toot from '@/components/organisms/Toot'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'

export default {
  data() {
    return {
      heading: true,
      focusedId: null
    }
  },
  name: 'bookmarks',
  components: { Toot },
  mixins: [reloadable],
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
      lazyLoading: state => state.lazyLoading
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
    document.getElementById('scroller').addEventListener('scroll', this.onScroll)
    Event.$on('focus-timeline', () => {
      // If focusedId does not change, we have to refresh focusedId because Toot component watch change events.
      const previousFocusedId = this.focusedId
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = previousFocusedId
      })
    })
  },
  beforeUnmount() {
    Event.$off('focus-timeline')
  },
  unmounted() {
    this.$store.commit('TimelineSpace/Contents/Bookmarks/updateBookmarks', [])
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
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('scroller').scrollHeight - 10 &&
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
      this.$refs.scroller.scrollToItem(0)
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
#bookmarks {
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
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

  .upper-icon {
    padding: 3px;
  }
}
</style>
