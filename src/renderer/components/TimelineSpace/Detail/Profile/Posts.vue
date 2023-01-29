<template>
  <DynamicScroller :items="statuses" :min-item-size="86">
    <template #default="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.uri]" :data-index="index" :watchData="true">
        <Toot
          v-if="account && server"
          :message="item"
          :focused="item.uri + item.id === focusedId"
          :overlaid="modalOpened"
          :account="account"
          :server="server"
          @update="updateToot"
          @delete="deleteToot"
          @select-toot="focusToot(item)"
        />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, ref, watch, toRefs, computed } from 'vue'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { useStore } from '@/store'

export default defineComponent({
  name: 'Posts',
  components: { Toot },
  props: {
    user: {
      type: Object as PropType<Entity.Account>,
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
  },
  setup(props) {
    const { user, account, server } = toRefs(props)
    const store = useStore()

    const statuses = ref<Array<Entity.Status>>([])
    const client = ref<MegalodonInterface | null>(null)
    const focusedId = ref<string | null>(null)

    const userAgent = computed(() => store.state.App.userAgent)
    const modalOpened = computed<boolean>(() => store.getters[`TimelineSpace/Modals/modalOpened`])

    onMounted(async () => {
      client.value = generator(server.value.sns, server.value.baseURL, account.value.accessToken, userAgent.value)
      const res = await client.value.getAccountStatuses(user.value.id)
      statuses.value = res.data
    })

    watch(user, async current => {
      if (client.value) {
        const res = await client.value.getAccountStatuses(current.id)
        statuses.value = res.data
      }
    })

    const updateToot = (toot: Entity.Status) => {
      statuses.value = statuses.value.map(s => {
        if (s.id === toot.id) {
          return toot
        }
        return s
      })
    }

    const deleteToot = (toot: Entity.Status) => {
      statuses.value = statuses.value.filter(s => s.id !== toot.id)
    }

    const focusToot = (toot: Entity.Status) => {
      focusedId.value = toot.uri + toot.id
    }

    return {
      statuses,
      modalOpened,
      updateToot,
      deleteToot,
      focusedId,
      focusToot
    }
  }
})
</script>

<style lang="scss" scoped></style>
