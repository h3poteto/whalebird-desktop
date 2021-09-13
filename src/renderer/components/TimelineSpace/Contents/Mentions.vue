<template>
  <div id="mentions" v-shortkey="shortcutEnabled ? { next: ['j'] } : {}" @shortkey="handleKey">
    <div v-shortkey="{ linux: ['ctrl', 'r'], mac: ['meta', 'r'] }" @shortkey="reload()"></div>
    <DynamicScroller :items="mentions" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.url]" :data-index="index" :watchData="true">
          <notification
            :message="item"
            :focused="item.id === focusedId"
            :overlaid="modalOpened"
            :filters="[]"
            v-on:update="updateToot"
            @focusNext="focusNext"
            @focusPrev="focusPrev"
            @focusRight="focusSidebar"
            @selectNotification="focusNotification(item)"
          >
          </notification>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
      <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle> </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
import Notification from '~/src/renderer/components/organisms/Notification'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'
import { ScrollPosition } from '~/src/renderer/components/utils/scroll'

export default {
  name: 'mentions',
  components: { Notification },
  mixins: [reloadable],
  data() {
    return {
      focusedId: null,
      scrollPosition: null,
      observer: null,
      scrollTime: null,
      resizeTime: null
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
      scrolling: state => state.scrolling
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
    ...mapGetters('TimelineSpace/Contents/Mentions', ['mentions']),
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
  mounted() {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadMentions', false)
    document.getElementById('scroller').addEventListener('scroll', this.onScroll)
    Event.$on('focus-timeline', () => {
      // If focusedId does not change, we have to refresh focusedId because Toot component watch change events.
      const previousFocusedId = this.focusedId
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = previousFocusedId
      })
    })
    const el = document.getElementById('scroller')
    this.scrollPosition = new ScrollPosition(el)
    this.scrollPosition.prepare()

    this.observer = new ResizeObserver(() => {
      if (this.scrollPosition && !this.heading && !this.lazyLoading && !this.scrolling) {
        this.resizeTime = moment()
        this.scrollPosition.restore()
      }
    })

    const scrollWrapper = el.getElementsByClassName('vue-recycle-scroller__item-wrapper')[0]
    this.observer.observe(scrollWrapper)
  },
  beforeUpdate() {
    if (this.$store.state.TimelineSpace.SideMenu.unreadMentions && this.heading) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadMentions', false)
    }
    if (this.scrollPosition) {
      this.scrollPosition.prepare()
    }
  },
  beforeDestroy() {
    Event.$off('focus-timeline')
    this.observer.disconnect()
  },
  destroyed() {
    this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Mentions/archiveMentions')
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
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', true)
      }
    }
  },
  methods: {
    onScroll(event) {
      if (moment().diff(this.resizeTime) < 500) {
        return
      }
      this.scrollTime = moment()
      if (!this.scrolling) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeScrolling', true)
      }

      // for lazyLoading
      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('scroller').scrollHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store
          .dispatch('TimelineSpace/Contents/Mentions/lazyFetchMentions', this.mentions[this.mentions.length - 1])
          .then(statuses => {
            if (statuses === null) {
              return
            }
            if (statuses.length > 0) {
              this.$store.commit('TimelineSpace/Contents/Mentions/changeScrolling', true)
              setTimeout(() => {
                this.$store.commit('TimelineSpace/Contents/Mentions/changeScrolling', false)
              }, 500)
            }
          })
          .catch(() => {
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }

      if (event.target.scrollTop > 10 && this.heading) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', false)
      } else if (event.target.scrollTop <= 10 && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Mentions/changeHeading', true)
      }

      setTimeout(() => {
        const now = moment()
        if (now.diff(this.scrollTime) >= 150) {
          this.scrollTime = null
          this.$store.commit('TimelineSpace/Contents/Mentions/changeScrolling', false)
        }
      }, 150)
    },
    async reload() {
      this.$store.commit('TimelineSpace/changeLoading', true)
      try {
        await this.reloadable()
      } finally {
        this.$store.commit('TimelineSpace/changeLoading', false)
      }
    },
    updateToot(message) {
      this.$store.commit('TimelineSpace/Contents/Mentions/updateToot', message)
    },
    upper() {
      this.$refs.scroller.scrollToItem(0)
      this.focusedId = null
    },
    focusNext() {
      const currentIndex = this.mentions.findIndex(toot => this.focusedId === toot.id)
      if (currentIndex === -1) {
        this.focusedId = this.mentions[0].id
      } else if (currentIndex < this.mentions.length) {
        this.focusedId = this.mentions[currentIndex + 1].id
      }
    },
    focusPrev() {
      const currentIndex = this.mentions.findIndex(toot => this.focusedId === toot.id)
      if (currentIndex === 0) {
        this.focusedId = null
      } else if (currentIndex > 0) {
        this.focusedId = this.mentions[currentIndex - 1].id
      }
    },
    focusNotification(message) {
      this.focusedId = message.id
    },
    focusSidebar() {
      Event.$emit('focus-sidebar')
    },
    handleKey(event) {
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
  height: 100%;
  overflow: auto;
  scroll-behavior: auto;

  .scroller {
    height: 100%;
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
<style lang="scss" src="@/assets/timeline-transition.scss"></style>
