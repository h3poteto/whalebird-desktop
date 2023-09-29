<template>
  <el-main id="authorize">
    <div class="authorization-url">
      <p>{{ $t('authorize.manually_1') }}</p>
      <p>{{ $t('authorize.manually_2') }}</p>
      <p class="url">{{ $route.query.url }}</p>
    </div>
    <el-form
      ref="form"
      :model="authorizeForm"
      label-width="120px"
      label-position="top"
      class="authorize-form"
      @submit.prevent="authorizeSubmit"
    >
      <el-form-item :label="$t('authorize.code_label')">
        <el-input v-model="authorizeForm.code"></el-input>
      </el-form-item>
      <!-- Dummy form to guard submitting with enter -->
      <el-form-item class="hidden">
        <el-input></el-input>
      </el-form-item>
      <el-form-item class="submit">
        <el-button
          v-loading="submitting"
          type="primary"
          class="authorize"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          @click="authorizeSubmit"
        >
          {{ $t('authorize.submit') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-main>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { ElMessage } from 'element-plus'
import { useMagicKeys, whenever } from '@vueuse/core'
import { MyWindow } from '~/src/types/global'
import { LocalAccount } from '~/src/types/localAccount'

export default defineComponent({
  name: 'Authorize',
  setup() {
    const win = (window as any) as MyWindow
    const router = useRouter()
    const route = useRoute()
    const { t } = useTranslation()
    const { escape } = useMagicKeys()

    const authorizeForm = reactive({
      code: ''
    })
    const submitting = ref<boolean>(false)

    whenever(escape, () => {
      close()
    })

    const authorizeSubmit = async () => {
      submitting.value = true
      const code = authorizeForm.code
      try {
        const localAccount: LocalAccount = await win.ipcRenderer.invoke('authorize', {
          serverID: route.query.server_id,
          baseURL: route.query.base_url,
          clientID: route.query.client_id,
          clientSecret: route.query.client_secret,
          code: code
        })
        router.push({ path: `/${localAccount.id}/home` })
      } catch (err) {
        console.error(err)
        ElMessage({
          message: t('message.authorize_error'),
          type: 'error'
        })
      } finally {
        submitting.value = false
      }
    }

    const close = () => {
      router.push({ path: '/', query: { redirect: 'home' } })
    }

    return {
      authorizeForm,
      submitting,
      authorizeSubmit,
      close,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#authorize {
  background-color: #292f3f;
  color: #fff;
  text-align: center;
  min-height: 100%;

  .close {
    text-align: right;

    .close-button {
      font-size: 24px;
    }
  }

  .authorization-url {
    margin: 0 auto 64px;
    max-width: 80%;

    .url {
      color: #909399;
      word-wrap: break-word;
    }
  }

  .authorize-form {
    width: 500px;
    margin: 0 auto;

    .authorize {
      margin: 0 auto;
    }
  }

  .authorize-form :deep() {
    .el-form-item__label {
      color: #f0f3f9;
    }

    .el-input__inner {
      background-color: #373d48;
      color: #fff;
      border: 0;
    }

    .el-input__wrapper {
      background-color: #373d48;
    }
  }

  .hidden {
    display: none;
  }
}
</style>
