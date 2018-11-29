<template>
  <div class="toot-detail" ref="detail">
    <div class="toot-ancestors" v-for="(message, index) in ancestors" v-bind:key="'ancestors-' + index">
      <toot
        :message="message"
        :focused="message.uri + message.id === focusedId"
        :overlaid="modalOpened"
        v-on:update="updateAncestorsToot"
        v-on:delete="deleteAncestorsToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusLeft="focusTimeline"
        @selectToot="focusToot(message)"
        >
      </toot>
    </div>
    <div class="original-toot" ref="original">
      <toot
        :message="message"
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
    </div>
    <div class="toot-descendants" v-for="(message, index) in descendants" v-bind:key="'descendants' + index">
      <toot
        :message="message"
        :focused="message.uri + message.id === focusedId"
        :overlaid="modalOpened"
        v-on:update="updateDescendantsToot"
        v-on:delete="deleteDescendantsToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusLeft="focusTimeline"
        @selectToot="focusToot(message)"
        >
      </toot>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Toot from '~/src/renderer/components/molecules/Toot'
import { Event } from '~/src/renderer/components/event'

export default {
  name: 'toot-detail',
  components: { Toot },
  data () {
    return {
      focusedId: null
    }
  },
  computed: {
    ...mapState('TimelineSpace/Contents/SideBar/TootDetail', {
      message: state => state.message,
      ancestors: state => state.ancestors,
      descendants: state => state.descendants,
      timeline: state => state.ancestors.concat([state.message]).concat(state.descendants)
    }),
    ...mapGetters('TimelineSpace/Modals', [
      'modalOpened'
    ])
  },
  created () {
    this.load()
  },
  mounted () {
    Event.$on('focus-sidebar', () => {
      this.focusedId = 0
      this.$nextTick(function () {
        this.focusedId = this.timeline[0].uri + this.timeline[0].id
      })
    })
  },
  watch: {
    message: function () {
      this.load()
    }
  },
  beforeDestroy () {
    Event.$emit('focus-timeline')
    Event.$off('focus-sidebar')
  },
  methods: {
    load () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/fetchToot', this.message)
        .then(() => {
          const toot = this.$refs.original
          toot.scrollIntoView()
        })
        .catch(() => {
          this.$message({
            message: this.$t('message.toot_fetch_error'),
            type: 'error'
          })
        })
    },
    updateAncestorsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/updateAncestorsToot', message)
    },
    deleteAncestorsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/deleteAncestorsToot', message)
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/deleteToot', message)
    },
    updateDescendantsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/updateDescendantsToot', message)
    },
    deleteDescendantsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/deleteDescendantsToot', message)
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
.toot-detail {
  .original-toot {
    .toot {
      background-color: var(--theme-selected-background-color);
      outline: 0;
    }
  }
}
</style>
