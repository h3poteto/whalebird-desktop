<template>
  <div id="home">
    <div></div>
    <DynamicScroller :items="filteredTimeline" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <template v-if="item.id === 'loading-card'">
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.id]" :data-index="index" :watchData="true">
            <StatusLoading :since_id="item.since_id" :max_id="item.max_id" :loading="loadingMore" @load_since="fetchTimelineSince" />
          </DynamicScrollerItem>
        </template>
        <template v-else>
          <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
            <toot
              :message="item"
              :focused="item.uri + item.id === focusedId"
              :overlaid="modalOpened"
              :filters="filters"
              v-on:update="updateToot"
              v-on:delete="deleteToot"
              @focusNext="focusNext"
              @focusPrev="focusPrev"
              @focusRight="focusSidebar"
              @selectToot="focusToot(item)"
              @sizeChanged="sizeChanged"
            >
            </toot>
          </DynamicScrollerItem>
        </template>
      </template>
    </DynamicScroller>

    <div :class="openSideBar ? 'upper-with-side-bar' : 'upper'" v-show="!heading">
      <el-button type="primary" @click="upper" circle>
        <font-awesome-icon icon="arrow-up" />
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
import Toot from '~/src/renderer/components/organisms/Toot'
import StatusLoading from '~/src/renderer/components/organisms/StatusLoading'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { Event } from '~/src/renderer/components/event'
import { ScrollPosition } from '~/src/renderer/components/utils/scroll'

export default {
  data() {
    return {
      focusedId: null,
      scrollPosition: null,
      observer: null,
      scrollTime: null,
      resizeTime: null,
      loadingMore: false
    }
  },
  name: 'home',
  components: { Toot, StatusLoading },
  mixins: [reloadable],
  computed: {
    ...mapState('TimelineSpace/Contents/Home', {
      timeline: state => state.timeline,
      lazyLoading: state => state.lazyLoading,
      heading: state => state.heading,
      showReblogs: state => state.showReblogs,
      showReplies: state => state.showReplies,
      scrolling: state => state.scrolling
    }),
    ...mapState({
      backgroundColor: state => state.App.theme.background_color,
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      startReload: state => state.TimelineSpace.HeaderMenu.reload
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
    ...mapGetters('TimelineSpace/Contents/Home', ['filters']),
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
    },
    filteredTimeline() {
      return this.timeline.filter(toot => {
        if (toot.in_reply_to_id) {
          return this.showReplies
        } else if (toot.reblog) {
          return this.showReblogs
        } else {
          return true
        }
      })
    }
  },
  mounted() {
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', false)
    document.getElementById('scroller').addEventListener('scroll', this.onScroll)
    Event.$on('focus-timeline', () => {
      // If focusedId does not change, we have to refresh focusedId because Toot component watch change events.
      const previousFocusedId = this.focusedId
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = previousFocusedId
      })
    })

    if (this.heading && this.timeline.length > 0) {
      this.$store.dispatch('TimelineSpace/Contents/Home/saveMarker')
    }
    const el = document.getElementById('scroller')
    this.scrollPosition = new ScrollPosition(el)
    this.scrollPosition.prepare()

    this.observer = new ResizeObserver(() => {
      if (this.loadingMore || (this.scrollPosition && !this.heading && !this.lazyLoading && !this.scrolling)) {
        this.resizeTime = moment()
        this.scrollPosition.restore()
      }
    })

    const scrollWrapper = el.getElementsByClassName('vue-recycle-scroller__item-wrapper')[0]
    this.observer.observe(scrollWrapper)
  },
  beforeUpdate() {
    if (this.$store.state.TimelineSpace.SideMenu.unreadHomeTimeline && this.heading) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', false)
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
    this.$store.commit('TimelineSpace/Contents/Home/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Home/archiveTimeline')
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
        this.$store.commit('TimelineSpace/Contents/Home/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Home/changeHeading', true)
      }
    },
    timeline: function (newState, _oldState) {
      if (this.heading && newState.length > 0) {
        this.$store.dispatch('TimelineSpace/Contents/Home/saveMarker')
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
        this.$store.commit('TimelineSpace/Contents/Home/changeScrolling', true)
      }

      // for lazyLoading
      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('scroller').scrollHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store
          .dispatch('TimelineSpace/Contents/Home/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
          .then(statuses => {
            if (statuses === null) {
              return
            }
            if (statuses.length > 0) {
              this.$store.commit('TimelineSpace/Contents/Home/changeScrolling', true)
              setTimeout(() => {
                this.$store.commit('TimelineSpace/Contents/Home/changeScrolling', false)
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
        this.$store.commit('TimelineSpace/Contents/Home/changeHeading', false)
      } else if (event.target.scrollTop <= 5 && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Home/changeHeading', true)
      }

      setTimeout(() => {
        const now = moment()
        if (now.diff(this.scrollTime) >= 150) {
          this.scrollTime = null
          this.$store.commit('TimelineSpace/Contents/Home/changeScrolling', false)
        }
      }, 150)
    },
    updateToot(message) {
      this.$store.commit('TimelineSpace/Contents/Home/updateToot', message)
    },
    deleteToot(message) {
      this.$store.commit('TimelineSpace/Contents/Home/deleteToot', message.id)
    },
    fetchTimelineSince(since_id) {
      this.loadingMore = true
      this.$store.dispatch('TimelineSpace/Contents/Home/fetchTimelineSince', since_id).finally(() => {
        setTimeout(() => {
          this.loadingMore = false
        }, 500)
      })
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
      this.$refs.scroller.scrollToItem(0)
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
    },
    sizeChanged() {
      this.$store.commit('TimelineSpace/Contents/Home/changeScrolling', true)
      setTimeout(() => {
        this.$store.commit('TimelineSpace/Contents/Home/changeScrolling', false)
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
#home {
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
    transition: all 0.5s;
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
