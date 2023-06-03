<template>
  <el-form
    ref="loginFormRef"
    label-width="120px"
    label-position="top"
    v-on:submit.prevent="confirm(loginFormRef)"
    class="login-form"
    :rules="rules"
    :model="form"
  >
    <el-form-item :label="$t('login.domain_name_label')" prop="domainName">
      <el-input v-model="form.domainName" placeholder="mastodon.social"></el-input>
    </el-form-item>
    <p class="proxy-info">
      {{ $t('login.proxy_info') }}<router-link to="/preferences/network">{{ $t('login.proxy_here') }}</router-link>
    </p>
    <!-- Dummy form to guard submitting with enter -->
    <el-form-item class="hidden">
      <el-input></el-input>
    </el-form-item>
    <el-form-item class="submit">
      <el-button type="primary" class="login" @click="login" v-if="allowLogin">
        {{ $t('login.login') }}
      </el-button>
      <el-button
        type="primary"
        class="search"
        v-else
        @click="confirm(loginFormRef)"
        v-loading="searching"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        {{ $t('login.search') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from 'vue'
import { useTranslation } from 'i18next-vue'
import { ElLoading, ElMessage, FormInstance, FormRules } from 'element-plus'
import { domainFormat } from '@/utils/validator'
import { detector, OAuth } from 'megalodon'
import { MyWindow } from '~/src/types/global'
import { useRouter } from 'vue-router'
import { LocalServer } from '~/src/types/localServer'

export default defineComponent({
  name: 'login-form',
  setup() {
    const { t } = useTranslation()
    const router = useRouter()
    const win = (window as any) as MyWindow

    const form = reactive({
      domainName: ''
    })
    const loginFormRef = ref<FormInstance>()
    const domain = ref<string>('')
    const searching = ref<boolean>(false)
    const allowLogin = computed(() => domain.value && form.domainName == domain.value)
    const sns = ref<'mastodon' | 'pleroma' | 'misskey'>('mastodon')

    const rules = reactive<FormRules>({
      domainName: [
        {
          type: 'string',
          required: true,
          message: t('validation.login.require_domain_name')
        },
        {
          pattern: domainFormat,
          trigger: 'change',
          message: t('validation.login.domain_format')
        }
      ]
    })

    const login = async () => {
      const loading = ElLoading.service({
        lock: true,
        text: t('message.loading'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        const server: LocalServer = await win.ipcRenderer.invoke('add-server', domain.value)
        const appData: OAuth.AppData = await win.ipcRenderer.invoke('add-app', `https://${domain.value}`)
        router.push({
          path: '/login/authorize',
          query: {
            server_id: server.id,
            base_url: server.baseURL,
            client_id: appData.client_id,
            client_secret: appData.client_secret,
            session_token: appData.session_token,
            sns: sns.value,
            url: appData.url
          }
        })
      } catch (err) {
        ElMessage({
          message: t('message.authorize_url_error'),
          type: 'error'
        })
        console.error(err)
      } finally {
        loading.close()
      }
    }

    const confirm = async (formEl: FormInstance | undefined) => {
      if (!formEl) return
      await formEl.validate(async valid => {
        if (valid) {
          searching.value = true
          try {
            const cleanDomain = form.domainName.trim()
            sns.value = await detector(`https://${cleanDomain}`)
            domain.value = cleanDomain
            ElMessage({
              message: t('message.domain_confirmed', {
                domain: cleanDomain
              }),
              type: 'success'
            })
          } catch (err) {
            console.error(err)
            ElMessage({
              message: t('message.domain_doesnt_exist', {
                domain: form.domainName
              }),
              type: 'error'
            })
          } finally {
            searching.value = false
          }
          return true
        } else {
          ElMessage({
            message: t('validation.login.domain_format'),
            type: 'error'
          })
          return false
        }
      })
    }

    return {
      form,
      loginFormRef,
      searching,
      allowLogin,
      rules,
      login,
      confirm,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
.login-form {
  margin: 0 auto;
  width: 300px;

  .instance-group {
    text-align: left;
    margin: 0 auto;
  }

  .instance-list {
    display: block;
    margin-left: 0 !important;
    border-color: #606266;
    color: #dcdfe6;
    margin-bottom: 10px;
  }

  .search {
    margin: 0 auto;
  }

  .login {
    margin: 0 auto;
  }

  .hidden {
    display: none;
  }

  .proxy-info {
    color: #dcdfe6;
    margin-bottom: 24px;
  }
}

.login-form :deep() {
  .el-form-item__label {
    color: #f0f3f9;
  }

  .el-input__inner {
    background-color: #373d48;
    color: #fff;
    box-shadow: none;
  }

  .el-input__wrapper {
    background-color: #373d48;
  }
}
</style>
