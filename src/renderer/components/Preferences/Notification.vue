<template>
<div id="notification">
  <h2>{{ $t('preferences.notification.title') }}</h2>
  <div class="notify">
    <h3>{{ $t('preferences.notification.notify.title') }}</h3>
    <table class="notification">
      <tbody>
        <tr>
          <td class="title">{{ $t('preferences.notification.notify.reply') }}</td>
          <td class="status">
            <el-switch
              v-model="notifyReply"
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.notification.notify.reblog') }}</td>
          <td class="status">
            <el-switch
              v-model="notifyReblog"
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.notification.notify.favourite') }}</td>
          <td class="status">
            <el-switch
              v-model="notifyFavourite"
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.notification.notify.follow') }}</td>
          <td class="status">
            <el-switch
              v-model="notifyFollow"
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
      </tbody>
    </table>
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
  }
}
</script>

<style lang="scss" scoped>
#notification {
  .notify {
    table {
      width: 100%;
    }

    td {
      padding: 16px 0;
    }

    .title {
      text-align: right;
      width: 50%;
    }

    .status {
      width: 50%;
      text-align: center;
    }
  }
}
</style>
