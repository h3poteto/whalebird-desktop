<template>
  <div id="follow-requests">
    <template v-for="account in requests">
      <user :user="account" :request="true" @acceptRequest="accept" @rejectRequest="reject"></user>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import User from '@/components/molecules/User.vue'
import { ACTION_TYPES } from '@/store/TimelineSpace/Contents/FollowRequests'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'follow-requests',
  components: { User },
  setup() {
    const space = 'TimelineSpace/Contents/FollowRequests'
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const requests = computed(() => store.state.TimelineSpace.Contents.FollowRequests.requests)

    onMounted(async () => {
      await initialize()
    })

    const initialize = async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      await store.dispatch(`${space}/${ACTION_TYPES.FETCH_REQUESTS}`, account).catch(_ => {
        ElMessage({
          message: i18n.t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
    }
    const accept = (user: Entity.Account) => {
      store.dispatch(`${space}/${ACTION_TYPES.ACCEPT_REQUEST}`, { user, account: account.account, server: account.server }).catch(_ => {
        ElMessage({
          message: i18n.t('message.follow_request_accept_error'),
          type: 'error'
        })
      })
    }
    const reject = (user: Entity.Account) => {
      store.dispatch(`${space}/${ACTION_TYPES.REJECT_REQUEST}`, { user, account: account.account, server: account.server }).catch(_ => {
        ElMessage({
          message: i18n.t('message.follow_request_reject_error'),
          type: 'error'
        })
      })
    }

    return {
      requests,
      accept,
      reject
    }
  }
})
</script>
