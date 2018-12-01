<template>
  <div id="search_account">
    <div v-bind:key="message.uri + message.id" v-for="message in results">
      <toot :message="message"></toot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '~/src/renderer/components/molecules/Toot'

export default {
  name: 'search-account',
  components: { Toot },
  computed: {
    ...mapState({
      results: state => state.TimelineSpace.Contents.Search.Toots.results
    })
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Search/Toots/updateResults', [])
  }
}
</script>

<style lang="scss" scoped>
</style>
