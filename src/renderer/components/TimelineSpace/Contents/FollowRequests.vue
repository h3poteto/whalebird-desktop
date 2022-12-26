<template>
  <div id="follow-requests">
    <template v-for="account in requests">
      <user :user="account" :request="true" @acceptRequest="accept" @rejectRequest="reject"></user>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import User from '@/components/molecules/User.vue'
import { ACTION_TYPES } from '@/store/TimelineSpace/Contents/FollowRequests'

export default defineComponent({
  name: 'follow-requests',
  components: { User },
  setup() {
    const space = 'TimelineSpace/Contents/FollowRequests'
    const store = useStore()
    const i18n = useI18next()

    const requests = computed(() => store.state.TimelineSpace.Contents.FollowRequests.requests)

    onMounted(async () => {
      await initialize()
    })

    const initialize = async () => {
      await store.dispatch(`${space}/${ACTION_TYPES.FETCH_REQUESTS}`).catch(_ => {
        ElMessage({
          message: i18n.t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
    }
    const accept = (account: Entity.Account) => {
      store.dispatch(`${space}/${ACTION_TYPES.ACCEPT_REQUEST}`, account).catch(_ => {
        ElMessage({
          message: i18n.t('message.follow_request_accept_error'),
          type: 'error'
        })
      })
    }
    const reject = (account: Entity.Account) => {
      store.dispatch(`${space}/${ACTION_TYPES.REJECT_REQUEST}`, account).catch(_ => {
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
