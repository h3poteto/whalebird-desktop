<template>
  <div id="search_tag">
    <DynamicScroller :items="results" :min-item-size="46" key-field="name" class="scroller" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.name]" :data-index="index" :watchData="true">
          <tag :tag="item"></tag>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
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
  destroyed() {
    this.$store.commit('TimelineSpace/Contents/Search/Tag/updateResults', [])
  }
}
</script>
