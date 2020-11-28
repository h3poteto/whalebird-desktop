<template>
  <div id="search_account">
    <DynamicScroller :items="results" :min-item-size="60" class="scroller" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot :message="item"></toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '~/src/renderer/components/organisms/Toot'

export default {
  name: 'search-account',
  components: { Toot },
  computed: {
    ...mapState({
      results: state => state.TimelineSpace.Contents.Search.Toots.results
    })
  },
  destroyed() {
    this.$store.commit('TimelineSpace/Contents/Search/Toots/updateResults', [])
  }
}
</script>

<style lang="scss" scoped></style>
