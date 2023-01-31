<template>
  <div class="status-detail">
    <div class="ancestors" v-for="mes in ancestors" :key="mes.id">
      <Toot
        v-if="account.account && account.server"
        :message="mes"
        :account="account.account"
        :server="account.server"
        @update="updateStatus"
      />
    </div>
    <div class="original-status">
      <Toot
        v-if="status !== null && account.account && account.server"
        :message="status"
        :account="account.account"
        :server="account.server"
        @update="updateStatus"
      />
    </div>
    <div class="descendants" v-for="mes in descendants" :key="mes.id">
      <Toot
        v-if="account.account && account.server"
        :message="mes"
        :account="account.account"
        :server="account.server"
        @update="updateStatus"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import generator, { MegalodonInterface, Entity } from 'megalodon'
import Toot from '@/components/organisms/Toot.vue'
import { useStore } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'

export default defineComponent({
  name: 'Status',
  components: { Toot },
  setup() {
    const win = (window as any) as MyWindow
    const store = useStore()
    const route = useRoute()

    const client = ref<MegalodonInterface | null>(null)
    const id = computed(() => parseInt(route.params.id as string))
    const statusId = computed(() => route.query.status_id?.toString())
    const userAgent = computed(() => store.state.App.userAgent)
    const status = ref<Entity.Status | null>(null)
    const ancestors = ref<Array<Entity.Status>>([])
    const descendants = ref<Array<Entity.Status>>([])
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s
      const c = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      client.value = c

      if (statusId.value) {
        const s = await c.getStatus(statusId.value)
        status.value = s.data
        const res = await c.getStatusContext(statusId.value)
        ancestors.value = res.data.ancestors
        descendants.value = res.data.descendants
      }
    })
    watch(statusId, async current => {
      if (client.value && current) {
        const s = await client.value.getStatus(current)
        status.value = s.data
        const res = await client.value.getStatusContext(current)
        ancestors.value = res.data.ancestors
        descendants.value = res.data.descendants
      }
    })

    const update = (target: Entity.Status, s: Entity.Status) => {
      if (target.id === s.id) {
        return s
      } else if (target.reblog !== null && target.reblog.id == s.id) {
        return Object.assign(target, { reblog: s })
      } else {
        return target
      }
    }

    const updateStatus = (s: Entity.Status) => {
      if (status.value) {
        status.value = update(status.value, s)
      }
      ancestors.value = ancestors.value.map(anc => update(anc, s))
      descendants.value = descendants.value.map(des => update(des, s))
    }

    return {
      account,
      status,
      ancestors,
      descendants,
      updateStatus
    }
  }
})
</script>

<style lang="scss">
.status-detail {
  .original-status {
    .status {
      background-color: var(--theme-selected-background-color);
      outline: 0;
    }
  }
}
</style>
