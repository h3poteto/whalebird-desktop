<template>
  <div id="search_account">
    <template v-for="account in results">
      <user :user="account"></user>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import User from '../Cards/User'

export default {
  name: 'search-account',
  components: { User },
  computed: {
    ...mapState({
      results: state => state.TimelineSpace.Contents.Search.Account.results
    })
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Search/Account/updateResults', [])
  }
}
</script>

<style lang="scss" scoped>
</style>
