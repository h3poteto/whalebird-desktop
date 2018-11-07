<template>
<div id="timeline">
  <div class="unread-notification section">
    <h3>{{ $t('settings.timeline.unread_notification.title') }}</h3>
    <p class="description">{{ $t('settings.timeline.unread_notification.description') }}</p>
    <table class="table">
      <tbody>
        <tr>
          <td class="title">
            {{ $t('settings.timeline.unread_notification.home') }}
          </td>
          <td class="status">
            <el-switch v-model="home" />
          </td>
        </tr>
        <tr>
          <td class="title">
            {{ $t('settings.timeline.unread_notification.direct') }}
          </td>
          <td class="status">
            <el-switch v-model="direct" />
          </td>
        </tr>
        <tr>
          <td class="title">
            {{ $t('settings.timeline.unread_notification.favourite') }}
          </td>
          <td class="status">
            <el-switch v-model="favourite" />
          </td>
        </tr>
        <tr>
          <td class="title">
            {{ $t('settings.timeline.unread_notification.local') }}
          </td>
          <td class="status">
            <el-switch v-model="local" />
          </td>
        </tr>
        <tr>
          <td class="title">
            {{ $t('settings.timeline.unread_notification.public') }}
          </td>
          <td class="status">
            <el-switch v-model="public" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
export default {
  name: 'Timeline',
  computed: {
    home: {
      get () {
        return this.$store.state.Settings.Timeline.unread_notification.home
      },
      set (value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          home: value
        })
      }
    },
    direct: {
      get () {
        return this.$store.state.Settings.Timeline.unread_notification.direct
      },
      set (value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          direct: value
        })
      }
    },
    favourite: {
      get () {
        return this.$store.state.Settings.Timeline.unread_notification.favourite
      },
      set (value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          favourite: value
        })
      }
    },
    local: {
      get () {
        return this.$store.state.Settings.Timeline.unread_notification.local
      },
      set (value) {
        this.$store.dispatch('Settings/Timeline/changeUnreadNotification', {
          local: value
        })
      }
    },
    public: {
      get () {
        return this.$store.state.Settings.Timeline.unread_notification.public
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

  .section {
    margin-bottom: 40px;
  }

  .table {
    tr {
      height: 3rem;
    }

    .title {
      width: 200px;
      text-align: right;
    }

    .status {
      width: 200px;
      text-align: center;
    }
  }
}
</style>
