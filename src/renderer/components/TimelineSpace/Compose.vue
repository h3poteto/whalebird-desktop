<template>
  <div class="compose">
    <el-form :model="form" class="compose-form">
      <el-input v-model="form.status" type="textarea" :autosize="{ minRows: 2 }" :placeholder="$t('modals.new_toot.status')" />
      <div class="form-footer">
        <el-button-group class="tool-buttons">
          <el-button link size="default">
            <font-awesome-icon icon="camera" />
          </el-button>
          <el-button link size="default" disabled>
            <font-awesome-icon icon="square-poll-horizontal" />
          </el-button>
          <el-button link size="default">
            <font-awesome-icon icon="globe" />
          </el-button>
          <el-button link size="default">
            <font-awesome-icon :icon="['far', 'face-smile']" />
          </el-button>
        </el-button-group>
        <div class="actions-group">
          <span>500</span>
          <el-button type="primary" @click="post"> {{ $t('modals.new_toot.toot') }} </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import generator, { MegalodonInterface } from 'megalodon'
import { useStore } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'

export default defineComponent({
  name: 'Compose',
  setup() {
    const route = useRoute()
    const store = useStore()
    const win = (window as any) as MyWindow

    const id = computed(() => parseInt(route.params.id as string))
    const userAgent = computed(() => store.state.App.userAgent)

    const client = ref<MegalodonInterface | null>(null)
    const form = reactive({
      status: ''
    })

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      const c = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      client.value = c
    })

    const post = async () => {
      if (!client.value) {
        return
      }
      try {
        await client.value.postStatus(form.status)
        clear()
      } catch (err) {
        console.error(err)
      }
    }

    const clear = () => {
      form.status = ''
    }

    return {
      form,
      post
    }
  }
})
</script>

<style lang="scss" scoped>
.compose {
  height: auto;
  width: 100%;
  box-sizing: border-box;

  .compose-form {
    height: calc(100% - 24px);
  }

  .compose-form :deep(.el-textarea__inner) {
    color: var(--theme-primary-color);
    background-color: var(--theme-background-color);
    box-shadow: 0 0 0 1px var(--theme-border-color, var(--theme-border-color)) inset;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;

    .tool-buttons {
      button {
        margin-right: 8px;
      }
    }

    .actions-group {
      span {
        margin-right: 8px;
        color: var(--theme-secondary-color);
      }
    }
  }
}
</style>
