<template>
  <div class="compose">
    <el-form :model="form" class="compose-form">
      <el-input v-model="form.status" type="textarea" :autosize="{ minRows: 2 }" :placeholder="$t('modals.new_toot.status')" />
      <div class="preview" ref="previewRef">
        <div class="image-wrapper" v-for="media in attachments" :key="media.id">
          <img :src="media.preview_url" class="preview-image" />
          <el-button class="remove-image" link @click="removeAttachment(media)"><font-awesome-icon icon="circle-xmark" /></el-button>
        </div>
      </div>
      <div class="form-footer">
        <el-button-group class="tool-buttons">
          <el-button link size="default" @click="selectImage">
            <font-awesome-icon icon="camera" />
          </el-button>
          <input name="image" type="file" class="image-input" ref="imageRef" @change="onChangeImage" />
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
          <el-button type="primary" @click="post" :loading="loading"> {{ $t('modals.new_toot.toot') }} </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import generator, { Entity, MegalodonInterface } from 'megalodon'
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
    const imageRef = ref<any>(null)
    const attachments = ref<Array<Entity.Attachment | Entity.AsyncAttachment>>([])
    const loading = ref<boolean>(false)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      const c = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      client.value = c
    })

    const post = async () => {
      if (!client.value) {
        return
      }
      let options = {}
      try {
        loading.value = true
        if (attachments.value.length > 0) {
          options = Object.assign(options, {
            media_ids: attachments.value.map(m => m.id)
          })
        }
        await client.value.postStatus(form.status, options)
        clear()
      } catch (err) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const clear = () => {
      form.status = ''
      attachments.value = []
    }

    const selectImage = () => {
      imageRef?.value?.click()
    }

    const onChangeImage = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.item(0)
      if (file === null || file === undefined) {
        return
      }
      await uploadImage(file)
    }

    const uploadImage = async (file: File) => {
      if (!client.value) {
        return
      }
      try {
        loading.value = true
        const res = await client.value.uploadMedia(file)
        attachments.value = [...attachments.value, res.data]
      } catch (err) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const removeAttachment = async (attachment: Entity.Attachment | Entity.AsyncAttachment) => {
      attachments.value = attachments.value.filter(e => e.id !== attachment.id)
    }

    return {
      form,
      post,
      imageRef,
      selectImage,
      onChangeImage,
      loading,
      attachments,
      removeAttachment
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

  .preview {
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;

    .image-wrapper {
      position: relative;
      display: flex;
      min-width: 10%;
      height: 80px;
      margin: 4px;

      .preview-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border: 0;
        border-radius: 8px;
      }

      .remove-image {
        position: absolute;
        top: 2px;
        left: 2px;
        padding: 0;
        cursor: pointer;
        font-size: 1.5rem;

        .fa-icon {
          font-size: 0.9rem;
          width: auto;
          height: 1em;
          max-width: 100%;
          max-height: 100%;
        }
      }
    }
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

      .image-input {
        display: none;
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
