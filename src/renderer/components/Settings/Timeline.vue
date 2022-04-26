<template>
  <div id="timeline">
    <h2>{{ $t('settings.timeline.title') }}</h2>
    <el-form class="unread-notification section" size="default" label-position="right" label-width="250px">
      <h3>{{ $t('settings.timeline.unread_notification.title') }}</h3>
      <p class="description">
        {{ $t('settings.timeline.unread_notification.description') }}
      </p>

      <el-form-item for="direct" :label="$t('settings.timeline.unread_notification.direct')">
        <el-switch v-model="direct" id="direct" />
      </el-form-item>
      <el-form-item for="local" :label="$t('settings.timeline.unread_notification.local')">
        <el-switch v-model="local" id="local" />
      </el-form-item>
      <el-form-item for="public" :label="$t('settings.timeline.unread_notification.public')">
        <el-switch v-model="public" id="public" />
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

<script>
export default {
  name: 'Timeline',
  computed: {
    direct: {
      get() {
        return this.$store.state.Settings.Timeline.setting.unreadNotification.direct
      },
      set(value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          direct: value
        })
      }
    },
    local: {
      get() {
        return this.$store.state.Settings.Timeline.setting.unreadNotification.local
      },
      set(value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          local: value
        })
      }
    },
    public: {
      get() {
        return this.$store.state.Settings.Timeline.setting.unreadNotification.public
      },
      set(value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          public: value
        })
      }
    },
    marker_home: {
      get() {
        return this.$store.state.Settings.Timeline.setting.useMarker.home
      },
      set(value) {
        this.$store.dispatch('Settings/Timeline/changeUseMarker', {
          home: value
        })
      }
    },
    marker_notifications: {
      get() {
        return this.$store.state.Settings.Timeline.setting.useMarker.notifications
      },
      set(value) {
        this.$store.dispatch('Settings/Timeline/changeUseMarker', {
          notifications: value
        })
      }
    },
    marker_mentions: {
      get() {
        return this.$store.state.Settings.Timeline.setting.useMarker.mentions
      },
      set(value) {
        this.$store.dispatch('Settings/Timeline/changeUseMarker', {
          mentions: value
        })
      }
    }
  },
  async created() {
    await this.$store.dispatch('Settings/Timeline/loadTimelineSetting')
  }
}
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
