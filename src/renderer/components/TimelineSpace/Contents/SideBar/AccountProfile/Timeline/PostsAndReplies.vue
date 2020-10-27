<template>
  <div id="timeline">
    <DynamicScroller :items="timeline" :min-item-size="60" class="scroller" :buffer="buffer" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index">
          <toot
            :message="item"
            :key="item.id"
            :focused="item.uri + item.id === focusedId"
            :overlaid="modalOpened"
            v-on:update="updateToot"
            v-on:delete="deleteToot"
            @focusNext="focusNext"
            @focusPrev="focusPrev"
            @focusLeft="focusTimeline"
            @selectToot="focusToot(item)"
          >
          </toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Toot from '~/src/renderer/components/organisms/Toot'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'posts-and-replies',
  props: ['account', 'buffer'],
  components: { Toot },
  data() {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/PostsAndReplies', {
      timeline: state => state.timeline,
      lazyLoading: state => state.lazyLoading
    }),
    ...mapState('App', {
      backgroundColor: state => state.theme.background_color
    }),
    ...mapGetters('TimelineSpace/Modals', ['modalOpened'])
  },
  created() {
    this.load()
  },
  mounted() {
    this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/PostsAndReplies/clearTimeline')
    document.getElementById('sidebar_scrollable').addEventListener('scroll', this.onScroll)
    Event.$on('focus-sidebar', () => {
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = this.timeline[0].uri + this.timeline[0].id
      })
    })
  },
  beforeDestroy() {
    Event.$emit('focus-timeline')
    Event.$off('focus-sidebar')
  },
  destroyed() {
    if (document.getElementById('sidebar_scrollable') !== undefined && document.getElementById('sidebar_scrollable') !== null) {
      document.getElementById('sidebar_scrollable').removeEventListener('scroll', this.onScroll)
    }
  },
  watch: {
    account: function (_newAccount, _oldAccount) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/PostsAndReplies/clearTimeline')
      this.load()
    }
  },
  methods: {
    load() {
      this.$store
        .dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/PostsAndReplies/fetchTimeline', this.account)
        .catch(() => {
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
    },
    updateToot(message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/PostsAndReplies/updateToot', message)
    },
    deleteToot(message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/PostsAndReplies/deleteToot', message)
    },
    onScroll(event) {
      // for lazyLoading
      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('account_profile').clientHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store
          .dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/PostsAndReplies/lazyFetchTimeline', {
            account: this.account,
            status: this.timeline[this.timeline.length - 1]
          })
          .catch(err => {
            console.error(err)
            this.$message({
              message: this.$t('message.timeline_fetch_error'),
              type: 'error'
            })
          })
      }
    },
    focusNext() {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex === -1) {
        this.focusedId = this.timeline[0].uri + this.timeline[0].id
      } else if (currentIndex < this.timeline.length - 1) {
        this.focusedId = this.timeline[currentIndex + 1].uri + this.timeline[currentIndex + 1].id
      }
    },
    focusPrev() {
      const currentIndex = this.timeline.findIndex(toot => this.focusedId === toot.uri + toot.id)
      if (currentIndex > 0) {
        this.focusedId = this.timeline[currentIndex - 1].uri + this.timeline[currentIndex - 1].id
      }
    },
    focusToot(message) {
      this.focusedId = message.uri + message.id
    },
    focusTimeline() {
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
