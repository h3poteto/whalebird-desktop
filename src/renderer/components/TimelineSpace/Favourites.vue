<template>
  <div id="favourites">
    <div class="fav" v-for="message in favourites" v-bind:key="message.id">
      <toot :message="message"></toot>
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
      favourites: state => state.TimelineSpace.Favourites.favourites
    })
  },
  created () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.$store.dispatch('TimelineSpace/Favourites/fetchFavourites', this.account)
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
  }
}
</script>

<style lang="scss" scoped>
#favourites {
  margin-left: 16px;
}
</style>
