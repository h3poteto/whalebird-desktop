<template>
  <div id="local">
    <div></div>
    <DynamicScroller :items="timeline" :min-item-size="86" id="scroller" class="scroller" ref="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot
            :message="item"
            :focused="item.uri + item.id === focusedId"
            :overlaid="modalOpened"
            :filters="[]"
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
import moment from 'moment'
import Toot from '~/src/renderer/components/organisms/Toot'
import reloadable from '~/src/renderer/components/mixins/reloadable'
import { EventEmitter } from '~/src/renderer/components/event'
import { ScrollPosition } from '~/src/renderer/components/utils/scroll'

export default {
  data() {
    return {
      focusedId: null,
      scrollPosition: null,
      observer: null,
      scrollTime: null,
      resizeTime: null
    }
  },
  name: 'local',
  components: { Toot },
  mixins: [reloadable],
  computed: {
    ...mapState('TimelineSpace/Contents/Local', {
      timeline: state => state.timeline,
      lazyLoading: state => state.lazyLoading,
      heading: state => state.heading,
      scrolling: state => state.scrolling
    }),
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      unreadNotification: state => state.TimelineSpace.timelineSetting.unreadNotification
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened']),
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
  async mounted() {
    console.log(this.unreadNotification)
    this.$store.commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', false)
    document.getElementById('scroller').addEventListener('scroll', this.onScroll)
    if (!this.unreadNotification.local) {
      this.$store.commit('TimelineSpace/Contents/changeLoading', true)
      await this.initialize().finally(_ => {
        this.$store.commit('TimelineSpace/Contents/changeLoading', false)
      })
    }

    EventEmitter.on('focus-timeline', () => {
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
    if (this.$store.state.TimelineSpace.SideMenu.unreadLocalTimeline && this.heading) {
      this.$store.commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', false)
    }
    if (this.scrollPosition) {
      this.scrollPosition.prepare()
    }
  },
  beforeUnmount() {
    if (!this.unreadNotification.local) {
      this.$store.dispatch('TimelineSpace/stopLocalStreaming')
      this.$store.dispatch('TimelineSpace/unbindLocalStreaming')
    }
    EventEmitter.off('focus-timeline')
    this.observer.disconnect()
  },
  unmounted() {
    this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
    this.$store.commit('TimelineSpace/Contents/Local/archiveTimeline')
    if (!this.unreadNotification.local) {
      this.$store.commit('TimelineSpace/Contents/Local/clearTimeline')
    }
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
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', false)
      } else if (newState === null && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
      }
    }
  },
  methods: {
    async initialize() {
      await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline').catch(_ => {
        this.$message({
          message: this.$t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
      await this.$store.dispatch('TimelineSpace/bindLocalStreaming')
      this.$store.dispatch('TimelineSpace/startLocalStreaming')
    },
    updateToot(message) {
      this.$store.commit('TimelineSpace/Contents/Local/updateToot', message)
    },
    deleteToot(message) {
      this.$store.commit('TimelineSpace/Contents/Local/deleteToot', message.id)
    },
    onScroll(event) {
      if (moment().diff(this.resizeTime) < 500) {
        return
      }
      this.scrollTime = moment()
      if (!this.scrolling) {
        this.$store.commit('TimelineSpace/Contents/Local/changeScrolling', true)
      }

      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('scroller').scrollHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store
          .dispatch('TimelineSpace/Contents/Local/lazyFetchTimeline', this.timeline[this.timeline.length - 1])
          .then(statuses => {
            if (statuses === null) {
              return
            }
            if (statuses.length > 0) {
              this.$store.commit('TimelineSpace/Contents/Local/changeScrolling', true)
              setTimeout(() => {
                this.$store.commit('TimelineSpace/Contents/Local/changeScrolling', false)
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
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', false)
      } else if (event.target.scrollTop <= 10 && !this.heading) {
        this.$store.commit('TimelineSpace/Contents/Local/changeHeading', true)
      }

      setTimeout(() => {
        const now = moment()
        if (now.diff(this.scrollTime) >= 150) {
          this.scrollTime = null
          this.$store.commit('TimelineSpace/Contents/Local/changeScrolling', false)
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
      EventEmitter.emit('focus-sidebar')
    },
    handleKey(event) {
      switch (event.srcKey) {
        case 'next':
          this.focusedId = this.timeline[0].uri + this.timeline[0].id
          break
      }
    },
    sizeChanged() {
      this.$store.commit('TimelineSpace/Contents/Local/changeScrolling', true)
      setTimeout(() => {
        this.$store.commit('TimelineSpace/Contents/Local/changeScrolling', false)
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
#local {
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

  .upper-icon {
    padding: 3px;
  }
}
</style>

<style lang="scss" src="@/assets/timeline-transition.scss"></style>
