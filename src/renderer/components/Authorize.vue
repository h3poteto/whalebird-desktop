<template>
  <div id="authorize">
    <div>
      <el-header>
        <el-row>
          <el-col :span="24" class="close">
            <el-button class="close-button" link @click="close">
              <font-awesome-icon icon="xmark"></font-awesome-icon>
            </el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
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
          v-on:submit.prevent="authorizeSubmit"
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, toRefs, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18next } from 'vue3-i18next'
import { ElMessage } from 'element-plus'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Authorize'

export default defineComponent({
  name: 'authorize',
  props: {
    url: {
      type: String,
      default: ''
    },
    sns: {
      type: String,
      default: 'mastodon'
    }
  },
  setup(props) {
    const space = 'Authorize'
    const store = useStore()
    const router = useRouter()
    const i18n = useI18next()
    const { escape } = useMagicKeys()

    const { url, sns } = toRefs(props)

    const authorizeForm = reactive({
      code: null
    })
    const submitting = ref<boolean>(false)

    onMounted(() => {
      console.log(url.value)
    })

    whenever(escape, () => {
      close()
    })

    const authorizeSubmit = () => {
      submitting.value = true
      store
        .dispatch(`${space}/${ACTION_TYPES.SUBMIT}`, {
          code: authorizeForm.code,
          sns: sns.value
        })
        .finally(() => {
          submitting.value = false
        })
        .then(id => {
          router.push({ path: `/${id}/home` })
        })
        .catch(err => {
          if (err.name === 'DuplicateRecordError') {
            ElMessage({
              message: i18n.t('message.authorize_duplicate_error'),
              type: 'error'
            })
          } else {
            ElMessage({
              message: i18n.t('message.authorize_error'),
              type: 'error'
            })
          }
        })
    }

    const close = () => {
      router.push({ path: '/', query: { redirect: 'home' } })
    }

    return {
      authorizeForm,
      submitting,
      authorizeSubmit,
      close
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
