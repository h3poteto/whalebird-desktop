<template>
  <div id="network">
    <h2>{{ $t('preferences.network.proxy.title') }}</h2>
    <el-form class="network section" label-width="120px">
      <div class="proxy-source">
        <el-radio v-model="source" label="no">{{ $t('preferences.network.proxy.no') }}</el-radio>
      </div>
      <div class="proxy-source">
        <el-radio v-model="source" label="system">{{ $t('preferences.network.proxy.system') }}</el-radio>
      </div>
      <div class="proxy-source">
        <el-radio v-model="source" label="manual">{{ $t('preferences.network.proxy.manual') }}</el-radio>
      </div>
      <el-form-item for="proxyProtocol" :label="$t('preferences.network.proxy.protocol')">
        <el-select v-model="proxyProtocol" placeholder="Select protocol" :disabled="!manualProxyConfiguration">
          <el-option :label="$t('preferences.network.proxy.protocol_list.http')" value="http"></el-option>
          <el-option :label="$t('preferences.network.proxy.protocol_list.https')" value="https"></el-option>
          <el-option :label="$t('preferences.network.proxy.protocol_list.socks4')" value="socks4"></el-option>
          <el-option :label="$t('preferences.network.proxy.protocol_list.socks4a')" value="socks4a"></el-option>
          <el-option :label="$t('preferences.network.proxy.protocol_list.socks5')" value="socks5"></el-option>
          <el-option :label="$t('preferences.network.proxy.protocol_list.socks5h')" value="socks5h"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item for="proxyHost" :label="$t('preferences.network.proxy.host')">
        <el-input v-model="proxyHost" :disabled="!manualProxyConfiguration" placeholder="proxy.example.com"></el-input>
      </el-form-item>
      <el-form-item for="proxyPort" :label="$t('preferences.network.proxy.port')">
        <el-input v-model="proxyPort" :disabled="!manualProxyConfiguration" placeholder="8080"></el-input>
      </el-form-item>
      <el-form-item for="proxyUsername" :label="$t('preferences.network.proxy.username')">
        <el-input v-model="proxyUsername" :disabled="!manualProxyConfiguration" placeholder="username"></el-input>
      </el-form-item>
      <el-form-item for="proxyPassword" :label="$t('preferences.network.proxy.password')">
        <el-input v-model="proxyPassword" :disabled="!manualProxyConfiguration" placeholder="password" show-password></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSave">{{ $t('preferences.network.save') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Preferences/Network'

export default defineComponent({
  name: 'network',
  setup() {
    const space = 'Preferences/Network'
    const store = useStore()
    const { t } = useTranslation()

    const manualProxyConfiguration = computed(() => store.getters[`${space}/manualProxyConfiguration`])
    const source = computed({
      get: () => store.state.Preferences.Network.source,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.CHANGE_SOURCE}`, value)
    })
    const proxyProtocol = computed({
      get: () => store.state.Preferences.Network.proxy.protocol,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_PROTOCOL}`, value)
    })
    const proxyHost = computed({
      get: () => store.state.Preferences.Network.proxy.host,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_HOST}`, value)
    })
    const proxyPort = computed({
      get: () => store.state.Preferences.Network.proxy.port,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_PORT}`, value)
    })
    const proxyUsername = computed({
      get: () => store.state.Preferences.Network.proxy.username,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_USERNAME}`, value)
    })
    const proxyPassword = computed({
      get: () => store.state.Preferences.Network.proxy.password,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_PASSWORD}`, value)
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_PROXY}`).catch(() => {
        ElMessage({
          message: t('message.preferences_load_error'),
          type: 'error'
        })
      })
    })

    const onSave = () => store.dispatch(`${space}/${ACTION_TYPES.SAVE_PROXY_CONFIG}`)

    return {
      manualProxyConfiguration,
      source,
      proxyProtocol,
      proxyHost,
      proxyPort,
      proxyUsername,
      proxyPassword,
      onSave,
      $t: t
    }
  },
  methods: {}
})
</script>

<style lang="scss" scoped>
.network {
  max-width: 720px;

  .proxy-source {
    line-height: 32px;
    margin: 12px 8px;
    font-size: 14px;
  }

  .proxy-source :deep(.el-radio) {
    color: var(--theme-primary-color);
  }
}

.network :deep(.el-form-item__label) {
  color: var(--theme-primary-color);
}
</style>
