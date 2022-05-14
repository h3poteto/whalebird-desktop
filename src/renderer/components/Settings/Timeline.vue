<template>
  <div id="timeline">
    <h2>{{ $t('settings.timeline.title') }}</h2>
    <el-form class="unread-notification section" size="default" label-position="right" label-width="250px">
      <h3>{{ $t('settings.timeline.unread_notification.title') }}</h3>
      <p class="description">
        {{ $t('settings.timeline.unread_notification.description') }}
      </p>

      <el-form-item for="direct" :label="$t('settings.timeline.unread_notification.direct')">
        <el-switch v-model="directNotify" id="direct" />
      </el-form-item>
      <el-form-item for="local" :label="$t('settings.timeline.unread_notification.local')">
        <el-switch v-model="localNotify" id="local" />
      </el-form-item>
      <el-form-item for="public" :label="$t('settings.timeline.unread_notification.public')">
        <el-switch v-model="publicNotify" id="public" />
      </el-form-item>
    </el-form>

    <el-form class="use-marker section" size="default" label-position="right" label-width="250px">
      <h3>{{ $t('settings.timeline.use_marker.title') }}</h3>
      <el-form-item for="marker_home" :label="$t('settings.timeline.use_marker.home')">
        <el-switch v-model="marker_home" id="marker_home" />
      </el-form-item>
      <el-form-item for="marker_notifications" :label="$t('settings.timeline.use_marker.notifications')">
        <el-switch v-model="marker_notifications" id="marker_notifications" />
      </el-form-item>
      <el-form-item for="marker_mentions" :label="$t('settings.timeline.use_marker.mentions')">
        <el-switch v-model="marker_mentions" id="marker_mentions" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Settings/Timeline'

export default defineComponent({
  name: 'Timeline',
  setup() {
    const space = 'Settings/Timeline'
    const store = useStore()

    const directNotify = computed({
      get: () => store.state.Settings.Timeline.setting.unreadNotification.direct,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_UNREAD_NOTIFICATION}`, {
          direct: value
        })
    })
    const localNotify = computed({
      get: () => store.state.Settings.Timeline.setting.unreadNotification.local,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_UNREAD_NOTIFICATION}`, {
          local: value
        })
    })
    const publicNotify = computed({
      get: () => store.state.Settings.Timeline.setting.unreadNotification.public,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_UNREAD_NOTIFICATION}`, {
          public: value
        })
    })
    const marker_home = computed({
      get: () => store.state.Settings.Timeline.setting.useMarker.home,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_USER_MARKER}`, {
          home: value
        })
    })
    const marker_notifications = computed({
      get: () => store.state.Settings.Timeline.setting.useMarker.notifications,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_USER_MARKER}`, {
          notifications: value
        })
    })
    const marker_mentions = computed({
      get: () => store.state.Settings.Timeline.setting.useMarker.mentions,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_USER_MARKER}`, {
          mentions: value
        })
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_TIMELINE_SETTING}`)
    })

    return {
      directNotify,
      localNotify,
      publicNotify,
      marker_home,
      marker_notifications,
      marker_mentions
    }
  }
})
</script>

<style lang="scss" scoped>
#timeline {
  .description {
    margin: 32px 0 20px;
  }

  .section {
    margin-bottom: 40px;
  }

  .section :deep(.el-form-item__label) {
    color: var(--theme-primary-color);
  }
}
</style>
