<template>
<div id="notification">
  <h2>{{ $t('preferences.notification.title') }}</h2>
  <el-form class="section" label-position="right" label-width="250px" size="small">
    <p class="description">{{ $t('preferences.notification.enable.description') }}</p>
    <el-form-item for="notifyReply" :label="$t('preferences.notification.enable.reply')">
      <el-switch
        id="notifyReply"
        v-model="notifyReply"
        active-color="#13ce66">
      </el-switch>
    </el-form-item>
    <el-form-item for="notifyReblog" :label="$t('preferences.notification.enable.reblog')">
      <el-switch
        id="notifyReblog"
        v-model="notifyReblog"
        active-color="#13ce66">
      </el-switch>
    </el-form-item>
    <el-form-item for="notifyFavourite" :label="$t('preferences.notification.enable.favourite')">
      <el-switch
        id="notifyFavourite"
        v-model="notifyFavourite"
        active-color="#13ce66">
      </el-switch>
    </el-form-item>
    <el-form-item for="notifyFollow" :label="$t('preferences.notification.enable.follow')">
      <el-switch
        v-model="notifyFollow"
        active-color="#13ce66">
      </el-switch>
    </el-form-item>
  </el-form>
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

  .section /deep/ {
    margin-bottom: 40px;

    .el-form-item__label {
      color: var(--theme-primary-color);
    }
  }
}
</style>
