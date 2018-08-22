<template>
<div id="favourites">
  <div v-shortkey="{linux: ['ctrl', 'r'], mac: ['meta', 'r']}" @shortkey="reload()">
  </div>
  <div class="fav" v-for="(message, index) in favourites" v-bind:key="message.id">
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
  <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor">
  </div>
  <div class="upper" v-show="!heading">
    <el-button type="primary" icon="el-icon-arrow-up" @click="upper" circle>
    </el-button>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Cards/Toot'
import scrollTop from '../../utils/scroll'

export default {
  name: 'favourites',
  components: { Toot },
  data () {
    return {
      heading: true,
      focusedIndex: null
    }
  },
  computed: {
    ...mapState({
      backgroundColor: state => state.App.theme.background_color,
      startReload: state => state.TimelineSpace.HeaderMenu.reload,
      account: state => state.TimelineSpace.account,
      favourites: state => state.TimelineSpace.Contents.Favourites.favourites,
      lazyLoading: state => state.TimelineSpace.Contents.Favourites.lazyLoading,
      filter: state => state.TimelineSpace.Contents.Favourites.filter
    })
  },
  created () {
    this.$store.commit('TimelineSpace/changeLoading', true)
    this.$store.dispatch('TimelineSpace/Contents/Favourites/fetchFavourites', this.account)
      .catch(() => {
        this.$message({
          message: this.$t('message.favourite_fetch_error'),
          type: 'error'
        })
      })
      .finally(() => {
        this.$store.commit('TimelineSpace/changeLoading', false)
      })
  },
  mounted () {
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Favourites/updateFavourites', [])
    if (document.getElementById('scrollable') !== undefined && document.getElementById('scrollable') !== null) {
      document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
      document.getElementById('scrollable').scrollTop = 0
    }
  },
  watch: {
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
        this.heading = false
      } else if (newState === null && !this.heading) {
        this.heading = true
      }
    }
  },
  methods: {
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Favourites/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/Favourites/deleteToot', message)
    },
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('favourites').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Favourites/lazyFetchFavourites', this.favourites[this.favourites.length - 1])
          .catch(() => {
            this.$message({
              message: this.$t('message.favourite_fetch_error'),
              type: 'error'
            })
          })
      }
      // for upper
      if ((event.target.scrollTop > 10) && this.heading) {
        this.heading = false
      } else if ((event.target.scrollTop <= 10) && !this.heading) {
        this.heading = true
      }
    },
    async reload () {
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

        await this.$store.dispatch('TimelineSpace/Contents/Home/fetchTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)
        await this.$store.dispatch('TimelineSpace/Contents/Favourites/fetchFavourites', account)
          .catch(() => {
            this.$message({
              message: this.$t('message.favourite_fetch_error'),
              type: 'error'
            })
          })

        this.$store.dispatch('TimelineSpace/startUserStreaming', account)
        this.$store.dispatch('TimelineSpace/startLocalStreaming', account)
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
      } else if (this.focusedIndex < this.favourites.length) {
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
