<template>
  <div id="search_account">
    <DynamicScroller :items="statuses" :min-item-size="60" class="scroller" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
          <toot :message="item" :account="account" :server="server"></toot>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Entity } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'

export default defineComponent({
  name: 'search-account',
  components: { Toot },
  props: {
    statuses: {
      type: Object as PropType<Array<Entity.Status>>,
      required: true
    },
    account: {
      type: Object as PropType<LocalAccount>,
      required: true
    },
    server: {
      type: Object as PropType<LocalServer>,
      required: true
    }
  }
})
</script>
