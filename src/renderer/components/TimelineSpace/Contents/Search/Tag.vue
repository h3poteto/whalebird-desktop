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

<script lang="ts">
import { defineComponent, onUnmounted, computed } from 'vue'
import { useStore } from '@/store'
import Tag from '@/components/molecules/Tag.vue'
import { MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Search/Tag'

export default defineComponent({
  name: 'search-tag',
  components: { Tag },
  setup() {
    const store = useStore()
    const results = computed(() => store.state.TimelineSpace.Contents.Search.Tag.results)

    onUnmounted(() => {
      store.commit(`TimelineSpace/Contents/Search/Tag/${MUTATION_TYPES.UPDATE_RESULTS}`, [])
    })

    return {
      results
    }
  }
})
</script>
