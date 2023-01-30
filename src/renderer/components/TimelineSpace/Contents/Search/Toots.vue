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
import { defineComponent, PropType } from 'vue'
import { Entity } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'

export default defineComponent({
  name: 'search-account',
  components: { Toot },
  props: {
    results: {
      type: Object as PropType<Array<Entity.Account>>,
      required: true
    }
  }
})
</script>
