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
import { defineComponent, PropType } from 'vue'
import { Entity } from 'megalodon'
import User from '@/components/molecules/User.vue'

export default defineComponent({
  name: 'search-account',
  components: { User },
  props: {
    results: {
      type: Object as PropType<Array<Entity.Account>>,
      required: true
    }
  }
})
</script>
