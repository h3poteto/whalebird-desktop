<template>
<div id="timeline">
  <h2>{{ $t('settings.timeline.title') }}</h2>
  <el-form class="unread-notification section" size="medium" label-position="right" label-width="250px">
    <h3>{{ $t('settings.timeline.unread_notification.title') }}</h3>
    <p class="description">{{ $t('settings.timeline.unread_notification.description') }}</p>

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
</div>
</template>

<script>
export default {
  name: 'Timeline',
  computed: {
    direct: {
      get () {
        return this.$store.state.Settings.Timeline.unreadNotification.direct
      },
      set (value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          direct: value
        })
      }
    },
    local: {
      get () {
        return this.$store.state.Settings.Timeline.unreadNotification.local
      },
      set (value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          local: value
        })
      }
    },
    public: {
      get () {
        return this.$store.state.Settings.Timeline.unreadNotification.public
      },
      set (value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          public: value
        })
      }
    }
  },
  async created () {
    await this.$store.dispatch('Settings/Timeline/loadUnreadNotification')
  }
}
</script>

<style lang="scss" scoped>
#timeline {
  .description {
    margin: 32px 0 20px;
  }

  .section /deep/ {
    margin-bottom: 40px;

    .el-form-item__label {
      color: var(--theme-primary-color);
    }
  }
}
</style>
