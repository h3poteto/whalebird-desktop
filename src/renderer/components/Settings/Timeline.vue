<template>
  <div id="timeline">
    <h2>{{ $t('settings.timeline.title') }}</h2>
    <el-form class="use-marker section" size="default" label-position="right" label-width="250px">
      <h3>{{ $t('settings.timeline.use_marker.title') }}</h3>
      <el-form-item for="marker_home" :label="$t('settings.timeline.use_marker.home')">
        <el-switch v-model="marker_home" id="marker_home" />
      </el-form-item>
      <el-form-item for="marker_notifications" :label="$t('settings.timeline.use_marker.notifications')">
        <el-switch v-model="marker_notifications" id="marker_notifications" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Settings/Timeline'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'Timeline',
  setup() {
    const space = 'Settings/Timeline'
    const store = useStore()
    const { t } = useTranslation()

    const marker_home = computed({
      get: () => store.state.Settings.Timeline.setting.markerHome,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_USER_MARKER}`, {
          markerHome: value
        })
    })
    const marker_notifications = computed({
      get: () => store.state.Settings.Timeline.setting.markerNotifications,
      set: value =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_USER_MARKER}`, {
          markerNotifications: value
        })
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_TIMELINE_SETTING}`)
    })

    return {
      marker_home,
      marker_notifications,
      $t: t
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
