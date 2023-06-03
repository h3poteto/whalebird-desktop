<template>
  <div id="notification">
    <h2>{{ $t('preferences.notification.title') }}</h2>
    <el-form class="section" label-position="right" label-width="360px">
      <p class="description">
        {{ $t('preferences.notification.enable.description') }}
      </p>
      <el-form-item for="notifyReply" :label="$t('preferences.notification.enable.reply')">
        <el-switch id="notifyReply" v-model="notifyReply" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyReblog" :label="$t('preferences.notification.enable.reblog')">
        <el-switch id="notifyReblog" v-model="notifyReblog" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyReaction" :label="$t('preferences.notification.enable.reaction')">
        <el-switch id="notifyReaction" v-model="notifyReaction" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyFavourite" :label="$t('preferences.notification.enable.favourite')">
        <el-switch id="notifyFavourite" v-model="notifyFavourite" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyFollow" :label="$t('preferences.notification.enable.follow')">
        <el-switch v-model="notifyFollow" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyFollowRequest" :label="$t('preferences.notification.enable.follow_request')">
        <el-switch v-model="notifyFollowRequest" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyStatus" :label="$t('preferences.notification.enable.status')">
        <el-switch v-model="notifyStatus" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyPollVote" :label="$t('preferences.notification.enable.poll_vote')">
        <el-switch v-model="notifyPollVote" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="notifyPollExpired" :label="$t('preferences.notification.enable.poll_expired')">
        <el-switch v-model="notifyPollExpired" active-color="#13ce66"> </el-switch>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Preferences/Notification'

export default defineComponent({
  name: 'notification',
  setup() {
    const space = 'Preferences/Notification'
    const store = useStore()
    const { t } = useTranslation()

    const notifyReply = computed({
      get: () => store.state.Preferences.Notification.notification.notify.reply,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          reply: value
        })
    })
    const notifyReblog = computed({
      get: () => store.state.Preferences.Notification.notification.notify.reblog,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          reblog: value
        })
    })
    const notifyFavourite = computed({
      get: () => store.state.Preferences.Notification.notification.notify.favourite,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          favourite: value
        })
    })
    const notifyFollow = computed({
      get: () => store.state.Preferences.Notification.notification.notify.follow,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          follow: value
        })
    })
    const notifyFollowRequest = computed({
      get: () => store.state.Preferences.Notification.notification.notify.follow_request,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          follow_request: value
        })
    })
    const notifyReaction = computed({
      get: () => store.state.Preferences.Notification.notification.notify.reaction,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          reaction: value
        })
    })
    const notifyStatus = computed({
      get: () => store.state.Preferences.Notification.notification.notify.status,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          status: value
        })
    })
    const notifyPollVote = computed({
      get: () => store.state.Preferences.Notification.notification.notify.poll_vote,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          poll_vote: value
        })
    })
    const notifyPollExpired = computed({
      get: () => store.state.Preferences.Notification.notification.notify.poll_expired,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_NOTIFY}`, {
          poll_expired: value
        })
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_NOTIFICATION}`).catch(() => {
        ElMessage({
          message: t('message.preferences_load_error'),
          type: 'error'
        })
      })
    })

    return {
      notifyReply,
      notifyReblog,
      notifyFavourite,
      notifyFollow,
      notifyFollowRequest,
      notifyReaction,
      notifyStatus,
      notifyPollVote,
      notifyPollExpired
    }
  }
})
</script>

<style lang="scss" scoped>
#notification {
  .description {
    margin: 24px 0 20px;
  }

  .section {
    margin-bottom: 40px;
  }

  .section :deep(.el-form-item__label) {
    color: var(--theme-primary-color);
  }
}
</style>
