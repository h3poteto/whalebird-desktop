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
      <p v-if="sns === 'misskey'">{{ $t('authorize.misskey_label') }}</p>
      <el-form-item :label="$t('authorize.code_label')" v-else>
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
import { defineComponent, ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18next } from 'vue3-i18next'
import { ElMessage } from 'element-plus'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Login'

export default defineComponent({
  name: 'Authorize',
  setup() {
    const space = 'Login'
    const store = useStore()
    const router = useRouter()
    const i18n = useI18next()
    const { escape } = useMagicKeys()

    const sns = computed(() => store.state.Login.sns)

    const authorizeForm = reactive({
      code: null
    })
    const submitting = ref<boolean>(false)

    whenever(escape, () => {
      close()
    })

    const authorizeSubmit = () => {
      submitting.value = true
      store
        .dispatch(`${space}/${ACTION_TYPES.AUTHORIZE}`, authorizeForm.code)
        .finally(() => {
          submitting.value = false
        })
        .then(id => {
          router.push({ path: `/${id}/home` })
        })
        .catch(err => {
          console.error(err)
          ElMessage({
            message: i18n.t('message.authorize_error'),
            type: 'error'
          })
        })
    }

    const close = () => {
      router.push({ path: '/', query: { redirect: 'home' } })
    }

    return {
      authorizeForm,
      submitting,
      authorizeSubmit,
      close,
      sns
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
