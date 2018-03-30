<template>
  <div id="favourites">
    <div class="fav" v-for="message in favourites" v-bind:key="message.id">
      <toot :message="message" v-on:update="updateToot"></toot>
    </div>
    <div class="loading-card" v-loading="lazyLoading">
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Cards/Toot'

export default {
  name: 'favourites',
  components: { Toot },
  computed: {
    ...mapState({
      account: state => state.TimelineSpace.account,
      favourites: state => state.TimelineSpace.Contents.Favourites.favourites,
      lazyLoading: state => state.TimelineSpace.Contents.Favourites.lazyLoading
    })
  },
  created () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.$store.dispatch('TimelineSpace/Contents/Favourites/fetchFavourites', this.account)
      .then(() => {
        loading.close()
      })
      .catch(() => {
        loading.close()
        this.$message({
          message: 'Could not fetch favourites',
          type: 'error'
        })
      })
  },
  mounted () {
    document.getElementById('scrollable').addEventListener('scroll', this.onScroll)
  },
  destroyed () {
    document.getElementById('scrollable').removeEventListener('scroll', this.onScroll)
  },
  methods: {
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Favourites/updateToot', message)
    },
    onScroll (event) {
      if (((event.target.clientHeight + event.target.scrollTop) >= document.getElementById('favourites').clientHeight - 10) && !this.lazyloading) {
        this.$store.dispatch('TimelineSpace/Contents/Favourites/lazyFetchFavourites', this.favourites[this.favourites.length - 1])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-card {
  background-color: #ffffff;
  height: 60px;
}

.loading-card:empty {
  height: 0;
}
</style>
