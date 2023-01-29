<template>
  <DynamicScroller :items="following" :min-item-size="53" class="scroller" page-mode>
    <template #default="{ item, index, active }">
      <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.item]" :data-index="index" :watchData="true">
        <User :user="item" :relationship="targetRelationship(item.id)" @follow-account="follow" @unfollow-account="unfollow" />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, ref, computed, onMounted, watch } from 'vue'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { useStore } from '@/store'
import User from '@/components/molecules/User.vue'

export default defineComponent({
  name: 'Following',
  components: { User },
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

    const following = ref<Array<Entity.Account>>([])
    const relationships = ref<Array<Entity.Relationship>>([])
    const client = ref<MegalodonInterface | null>(null)
    const userAgent = computed(() => store.state.App.userAgent)

    onMounted(async () => {
      client.value = generator(server.value.sns, server.value.baseURL, account.value.accessToken, userAgent.value)
      const res = await client.value.getAccountFollowing(user.value.id)
      const ids = res.data.map(a => a.id)
      const rel = await client.value.getRelationships(ids)
      following.value = res.data
      relationships.value = rel.data
    })

    watch(user, async current => {
      if (client.value) {
        const res = await client.value.getAccountFollowing(current.id)
        const ids = res.data.map(a => a.id)
        const rel = await client.value.getRelationships(ids)
        following.value = res.data
        relationships.value = rel.data
      }
    })

    const targetRelationship = (id: string) => {
      return relationships.value.find(r => r.id === id)
    }

    const follow = async (acct: Entity.Account) => {
      if (client.value) {
        const res = await client.value.followAccount(acct.id)
        relationships.value = relationships.value.map(r => {
          if (r.id === res.data.id) {
            return res.data
          }
          return r
        })
      }
    }

    const unfollow = async (acct: Entity.Account) => {
      if (client.value) {
        const res = await client.value.unfollowAccount(acct.id)
        relationships.value = relationships.value.map(r => {
          if (r.id === res.data.id) {
            return res.data
          }
          return r
        })
      }
    }

    return {
      following,
      targetRelationship,
      follow,
      unfollow
    }
  }
})
</script>

<style lang="scss" scoped></style>
