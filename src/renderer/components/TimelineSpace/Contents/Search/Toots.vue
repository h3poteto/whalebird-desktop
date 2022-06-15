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

<script lang="ts">
import { computed, defineComponent, onUnmounted } from 'vue'
import { useStore } from '@/store'
import Toot from '@/components/organisms/Toot.vue'
import { MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Search/Toots'

export default defineComponent({
  name: 'search-account',
  components: { Toot },
  setup() {
    const store = useStore()
    const results = computed(() => store.state.TimelineSpace.Contents.Search.Toots.results)

    onUnmounted(() => {
      this.$store.commit(`TimelineSpace/Contents/Search/Toots/${MUTATION_TYPES.UPDATE_RESULTS}`, [])
    })

    return {
      results
    }
  }
})
</script>
