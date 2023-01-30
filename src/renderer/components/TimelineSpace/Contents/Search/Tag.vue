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
import { defineComponent, PropType } from 'vue'
import { Entity } from 'megalodon'
import Tag from '@/components/molecules/Tag.vue'

export default defineComponent({
  name: 'search-tag',
  components: { Tag },
  props: {
    results: {
      type: Object as PropType<Array<Entity.Account>>,
      required: true
    }
  }
})
</script>
