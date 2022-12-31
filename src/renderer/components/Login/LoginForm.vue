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
import { useI18next } from 'vue3-i18next'
import { ElLoading, ElMessage, FormInstance, FormRules } from 'element-plus'
import { useStore } from '@/store'
import { domainFormat } from '@/utils/validator'
import { ACTION_TYPES } from '@/store/Login'

export default defineComponent({
  name: 'login-form',
  setup() {
    const space = 'Login'
    const store = useStore()
    const i18n = useI18next()

    const form = reactive({
      domainName: ''
    })
    const loginFormRef = ref<FormInstance>()

    const selectedInstance = computed(() => store.state.Login.domain)
    const searching = computed(() => store.state.Login.searching)
    const allowLogin = computed(() => selectedInstance.value && form.domainName === selectedInstance.value)
    const rules = reactive<FormRules>({
      domainName: [
        {
          type: 'string',
          required: true,
          message: i18n.t('validation.login.require_domain_name')
        },
        {
          pattern: domainFormat,
          trigger: 'change',
          message: i18n.t('validation.login.domain_format')
        }
      ]
    })

    const login = async () => {
      const loading = ElLoading.service({
        lock: true,
        text: i18n.t('message.loading'),
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.ADD_SERVER}`)
        await store.dispatch(`${space}/${ACTION_TYPES.ADD_APP}`)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.authorize_url_error'),
          type: 'error'
        })
        console.error(err)
      } finally {
        loading.close()
      }
    }

    const confirm = async (formEl: FormInstance | undefined) => {
      if (!formEl) return
      await formEl.validate(valid => {
        if (valid) {
          return store
            .dispatch(`${space}/${ACTION_TYPES.CONFIRM_INSTANCE}`, form.domainName)
            .then(() => {
              ElMessage({
                message: i18n.t('message.domain_confirmed', {
                  domain: form.domainName
                }),
                type: 'success'
              })
            })
            .catch(err => {
              ElMessage({
                message: i18n.t('message.domain_doesnt_exist', {
                  domain: form.domainName
                }),
                type: 'error'
              })
              console.error(err)
            })
        } else {
          ElMessage({
            message: i18n.t('validation.login.domain_format'),
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
      confirm
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
