<template>
  <div id="search_tag">
    <template v-for="tag in results">
      <tag :tag="tag"></tag>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Tag from '~/src/renderer/components/molecules/Tag'

export default {
  name: 'search-tag',
  components: { Tag },
  computed: {
    ...mapState('TimelineSpace/Contents/Search/Tag', {
      results: state => state.results
    })
  },
  destroyed () {
    this.$store.commit('TimelineSpace/Contents/Search/Tag/updateResults', [])
  }
}
</script>
