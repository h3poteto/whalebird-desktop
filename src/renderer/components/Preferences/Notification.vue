<template>
<div id="notification">
  <h2>{{ $t('preferences.notification.title') }}</h2>
  <div class="enable">
    <p class="description">{{ $t('preferences.notification.enable.description') }}</p>
    <div class="selection">
      <span class="value">
        <el-switch
          v-model="notifyReply"
          active-color="#13ce66">
        </el-switch>
      </span>
      <span class="title">{{ $t('preferences.notification.enable.reply') }}</span>
    </div>
    <div class="selection">
      <span class="value">
        <el-switch
          v-model="notifyReblog"
          active-color="#13ce66">
        </el-switch>
      </span>
      <span class="title">{{ $t('preferences.notification.enable.reblog') }}</span>
    </div>
    <div class="selection">
      <span class="value">
        <el-switch
          v-model="notifyFavourite"
          active-color="#13ce66">
        </el-switch>
      </span>
      <span class="title">{{ $t('preferences.notification.enable.favourite') }}</span>
    </div>
    <div class="selection">
      <span class="value">
        <el-switch
          v-model="notifyFollow"
          active-color="#13ce66">
        </el-switch>
      </span>
      <span class="title">{{ $t('preferences.notification.enable.follow') }}</span>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'notification',
  computed: {
    notifyReply: {
      get () {
        return this.$store.state.Preferences.Notification.notification.notify.reply
      },
      set (value) {
        this.$store.dispatch('Preferences/Notification/updateNotify', {
          reply: value
        })
      }
    },
    notifyReblog: {
      get () {
        return this.$store.state.Preferences.Notification.notification.notify.reblog
      },
      set (value) {
        this.$store.dispatch('Preferences/Notification/updateNotify', {
          reblog: value
        })
      }
    },
    notifyFavourite: {
      get () {
        return this.$store.state.Preferences.Notification.notification.notify.favourite
      },
      set (value) {
        this.$store.dispatch('Preferences/Notification/updateNotify', {
          favourite: value
        })
      }
    },
    notifyFollow: {
      get () {
        return this.$store.state.Preferences.Notification.notification.notify.follow
      },
      set (value) {
        this.$store.dispatch('Preferences/Notification/updateNotify', {
          follow: value
        })
      }
    }
  },
  created () {
    this.$store.dispatch('Preferences/Notification/loadNotification')
      .catch(() => {
        this.$message({
          message: this.$t('message.preferences_load_error'),
          type: 'error'
        })
      })
  }
}
</script>

<style lang="scss" scoped>
#notification {
  .description {
    margin: 24px 0 20px;
  }

  .selection {
    margin: 12px 0;

    .title {
      margin-left: 12px;
      font-weight: 800;
    }
  }
}
</style>
