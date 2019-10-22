<template>
  <div id="network">
    <h2>{{ $t('preferences.network.proxy.title') }}</h2>
    <el-form class="network session" size="small" label-position="top">
      <div class="proxy-source">
        <el-radio v-model="source" label="no">{{ $t('preferences.network.proxy.no') }}</el-radio>
      </div>
      <div class="proxy-source">
        <el-radio v-model="source" label="system">{{ $t('preferences.network.proxy.system') }}</el-radio>
      </div>
      <div class="proxy-source">
        <el-radio v-model="source" label="manual">{{ $t('preferences.network.proxy.manual') }}</el-radio>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'network',
  computed: {
    source: {
      get() {
        return this.$store.state.Preferences.Network.source
      },
      set(value) {
        this.$store.dispatch('Preferences/Network/changeSource', value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.network {
  .proxy-source {
    line-height: 32px;
    margin: 12px 8px;
    font-size: 14px;

    .el-radio /deep/ {
      color: var(--theme-secondary-color);
    }
  }
}
</style>
