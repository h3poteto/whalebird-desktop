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
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.notification.notify.reblog') }}</td>
          <td class="status">
            <el-switch
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.notification.notify.favourite') }}</td>
          <td class="status">
            <el-switch
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.notification.notify.follow') }}</td>
          <td class="status">
            <el-switch
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
  name: 'notification'
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
