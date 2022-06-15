<template>
  <div id="search_account">
    <DynamicScroller :items="results" :min-item-size="20" class="scroller" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.acct]" :data-index="index" :watchData="true">
          <user :user="item"></user>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted } from 'vue'
import { useStore } from '@/store'
import { MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Search/Account'
import User from '@/components/molecules/User.vue'

export default defineComponent({
  name: 'search-account',
  components: { User },
  setup() {
    const store = useStore()
    const results = computed(() => store.state.TimelineSpace.Contents.Search.Account.results)

    onUnmounted(() => {
      store.commit(`TimelineSpace/Contents/Search/Account/${MUTATION_TYPES.UPDATE_RESULTS}`, [])
    })

    return {
      results
    }
  },
  unmounted() {}
})
</script>
