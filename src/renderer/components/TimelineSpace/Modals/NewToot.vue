<template>
  <div class="new-toot">
    <el-dialog
      :title="$t('modals.new_toot.title')"
      :model-value="newTootModal"
      @update:model-value="newTootModal = $event"
      :before-close="closeConfirm"
      width="600px"
      custom-class="new-toot-modal"
      v-if="newTootModal"
    >
      <el-form v-on:submit.prevent="toot" role="form">
        <Quote :message="quoteToMessage" :displayNameStyle="displayNameStyle" v-if="quoteToMessage !== null" ref="quoteRef"></Quote>
        <div class="spoiler" v-if="showContentWarning" ref="spoilerRef">
          <div class="el-input">
            <input type="text" class="el-input__inner" :placeholder="$t('modals.new_toot.cw')" v-model="spoilerText" />
          </div>
        </div>
        <Status
          :modelValue="statusText"
          @update:modelValue="statusText = $event"
          :opened="newTootModal"
          :fixCursorPos="hashtagInserting"
          :height="statusHeight"
          @paste="onPaste"
          @toot="toot"
          ref="statusRef"
          v-if="newTootModal"
        />
      </el-form>
      <Poll
        v-if="openPoll"
        v-model:polls="polls"
        v-model:expire="pollExpire"
        @addPoll="addPoll"
        @removePoll="removePoll"
        ref="pollRef"
      ></Poll>
      <div class="preview" ref="previewRef">
        <div class="image-wrapper" v-for="media in attachedMedias" v-bind:key="media.id">
          <img :src="media.preview_url" class="preview-image" />
          <el-button type="text" @click="removeAttachment(media)" class="remove-image"><font-awesome-icon icon="circle-xmark" /></el-button>
          <textarea
            maxlength="420"
            class="image-description"
            :placeholder="$t('modals.new_toot.description')"
            :value="mediaDescriptions[media.id]"
            @input="updateDescription(media.id, $event.target.value)"
            role="textbox"
            contenteditable="true"
            aria-multiline="true"
          >
          </textarea>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="upload-image">
            <el-button size="default" type="text" @click="selectImage" :title="$t('modals.new_toot.footer.add_image')">
              <font-awesome-icon icon="camera" />
            </el-button>
            <input name="image" type="file" class="image-input" ref="imageRef" @change="onChangeImage" />
          </div>
          <div class="poll">
            <el-button size="default" type="text" @click="togglePollForm" :title="$t('modals.new_toot.footer.poll')">
              <font-awesome-icon icon="square-poll-horizontal" />
            </el-button>
          </div>
          <div class="privacy">
            <el-dropdown trigger="click" @command="changeVisibility">
              <el-button size="default" type="text" :title="$t('modals.new_toot.footer.change_visibility')">
                <font-awesome-icon :icon="visibilityIcon" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="visibilityList.Public.value">
                    <font-awesome-icon icon="globe" class="privacy-icon" />
                    {{ $t(visibilityList.Public.name) }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="visibilityList.Unlisted.value">
                    <font-awesome-icon icon="unlock" class="privacy-icon" />
                    {{ $t(visibilityList.Unlisted.name) }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="visibilityList.Private.value">
                    <font-awesome-icon icon="lock" class="privacy-icon" />
                    {{ $t(visibilityList.Private.name) }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="visibilityList.Direct.value">
                    <font-awesome-icon icon="envelope" class="privacy-icon" size="sm" />
                    {{ $t(visibilityList.Direct.name) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="sensitive" v-show="attachedMedias.length > 0">
            <el-button
              size="default"
              type="text"
              @click="changeSensitive"
              :title="$t('modals.new_toot.footer.change_sensitive')"
              :aria-pressed="sensitive"
            >
              <font-awesome-icon icon="eye-slash" v-show="!sensitive" />
              <font-awesome-icon icon="eye" v-show="sensitive" />
            </el-button>
          </div>
          <div class="content-warning">
            <el-button
              size="default"
              type="text"
              @click="toggleContentWarning()"
              :title="$t('modals.new_toot.footer.add_cw')"
              :class="showContentWarning ? '' : 'clickable'"
              :aria-pressed="showContentWarning"
            >
              <font-awesome-icon icon="eye-slash" />
            </el-button>
          </div>
          <div class="pined-hashtag">
            <el-button
              size="default"
              type="text"
              @click="pinedHashtag = !pinedHashtag"
              :title="$t('modals.new_toot.footer.pined_hashtag')"
              :class="pinedHashtag ? '' : 'clickable'"
              :aria-pressed="pinedHashtag"
            >
              <font-awesome-icon icon="hashtag" />
            </el-button>
          </div>
          <div class="info">
            <img src="../../../assets/images/loading-spinner-wide.svg" v-show="loading" class="loading" />
            <span class="text-count">{{ tootMax - statusText.length }}</span>

            <el-button class="toot-action" @click="closeConfirm(close)">{{ $t('modals.new_toot.cancel') }}</el-button>
            <el-button class="toot-action" type="primary" @click="toot" :loading="blockSubmit">{{ $t('modals.new_toot.toot') }}</el-button>
          </div>
          <div class="clearfix"></div>
        </div>
      </template>
      <resize-observer @notify="handleResize" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, ComponentPublicInstance, nextTick } from 'vue'
import { useI18next } from 'vue3-i18next'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import Visibility from '~/src/constants/visibility'
import Status from './NewToot/Status.vue'
import Poll from './NewToot/Poll.vue'
import Quote from './NewToot/Quote.vue'
import { NewTootTootLength, NewTootAttachLength, NewTootModalOpen, NewTootBlockSubmit, NewTootPollInvalid } from '@/errors/validations'
import { EventEmitter } from '@/components/event'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Modals/NewToot'

export default defineComponent({
  name: 'new-toot',
  components: {
    Status,
    Poll,
    Quote
  },
  setup() {
    const space = 'TimelineSpace/Modals/NewToot'
    const store = useStore()
    const i18n = useI18next()
    const visibilityList = Visibility

    const enableResizing = ref<boolean>(true)
    const statusText = ref<string>('')
    const spoilerText = ref<string>('')
    const showContentWarning = ref<boolean>(false)
    const openPoll = ref<boolean>(false)
    const polls = ref<Array<string>>([])
    const pollExpire = reactive({
      label: i18n.t('modals.new_toot.poll.expires.1_day'),
      value: 3600 * 24
    })
    const statusHeight = ref<number>(240)
    const previewRef = ref<HTMLElement>()
    const imageRef = ref<HTMLInputElement>()
    const pollRef = ref<ComponentPublicInstance>()
    const spoilerRef = ref<HTMLElement>()
    const quoteRef = ref<ComponentPublicInstance>()
    const statusRef = ref<InstanceType<typeof Status>>()

    const quoteToMessage = computed(() => store.state.TimelineSpace.Modals.NewToot.quoteToMessage)
    const attachedMedias = computed(() => store.state.TimelineSpace.Modals.NewToot.attachedMedias)
    const mediaDescriptions = computed(() => store.state.TimelineSpace.Modals.NewToot.mediaDescriptions)
    const blockSubmit = computed(() => store.state.TimelineSpace.Modals.NewToot.blockSubmit)
    const sensitive = computed(() => store.state.TimelineSpace.Modals.NewToot.sensitive)
    const initialStatus = computed(() => store.state.TimelineSpace.Modals.NewToot.initialStatus)
    const initialSpoiler = computed(() => store.state.TimelineSpace.Modals.NewToot.initialSpoiler)
    const visibilityIcon = computed(() => {
      switch (store.state.TimelineSpace.Modals.NewToot.visibility) {
        case Visibility.Public.value:
          return 'globe'
        case Visibility.Unlisted.value:
          return 'unlock'
        case Visibility.Private.value:
          return 'lock'
        case Visibility.Direct.value:
          return 'envelope'
        default:
          return 'globe'
      }
    })
    const loading = computed(() => store.state.TimelineSpace.Modals.NewToot.loading)
    const tootMax = computed(() => store.state.TimelineSpace.tootMax)
    const displayNameStyle = computed(() => store.state.App.displayNameStyle)
    const hashtagInserting = computed(() => store.getters[`${space}/hashtagInserting`])
    const newTootModal = computed({
      get: () => store.state.TimelineSpace.Modals.NewToot.modalOpen,
      set: (value: boolean) => {
        if (value) {
          store.dispatch(`${space}/${ACTION_TYPES.OPEN_MODAL}`)
        } else {
          store.dispatch(`${space}/${ACTION_TYPES.CLOSE_MODAL}`)
        }
      }
    })
    const pinedHashtag = computed({
      get: () => store.state.TimelineSpace.Modals.NewToot.pinedHashtag,
      set: (value: boolean) => store.commit(`${space}/${MUTATION_TYPES.CHANGE_PINED_HASHTAG}`, value)
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.SETUP_LOADING}`)
      EventEmitter.on('image-uploaded', () => {
        if (previewRef.value) {
          statusHeight.value = statusHeight.value - previewRef.value.offsetHeight
        }
      })

      showContentWarning.value = initialSpoiler.value.length > 0
      statusText.value = initialStatus.value
      spoilerText.value = initialSpoiler.value
    })

    const close = () => {
      store.dispatch(`${space}/${ACTION_TYPES.RESET_MEDIA_COUNT}`)
      store.dispatch(`${space}/${ACTION_TYPES.CLOSE_MODAL}`)
    }
    const toot = async () => {
      const form = {
        status: statusText.value,
        spoiler: spoilerText.value,
        polls: polls.value,
        pollExpireSeconds: pollExpire.value
      }

      try {
        const status = await store.dispatch(`${space}/${ACTION_TYPES.POST_TOOT}`, form)
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_HASHTAGS}`, status.tags)
        close()
      } catch (err) {
        console.error(err)
        if (err instanceof NewTootTootLength) {
          ElMessage({
            message: i18n.t('validation.new_toot.toot_length', {
              min: 1,
              max: tootMax.value
            }),
            type: 'error'
          })
        } else if (err instanceof NewTootAttachLength) {
          ElMessage({
            message: i18n.t('validation.new_toot.attach_length', { max: 4 }),
            type: 'error'
          })
        } else if (err instanceof NewTootPollInvalid) {
          ElMessage({
            message: i18n.t('validation.new_toot.poll_invalid'),
            type: 'error'
          })
        } else if (err instanceof NewTootModalOpen || err instanceof NewTootBlockSubmit) {
          // Nothing
        } else {
          ElMessage({
            message: i18n.t('message.toot_error'),
            type: 'error'
          })
        }
      }
    }
    const selectImage = () => {
      imageRef!.value!.click()
    }
    const updateImage = (file: File) => {
      store
        .dispatch(`${space}/${ACTION_TYPES.UPLOAD_IMAGE}`, file)
        .then(() => {
          enableResizing.value = false
          nextTick(() => {
            if (attachedMedias.value.length === 1 && previewRef.value) {
              statusHeight.value = statusHeight.value - previewRef.value.offsetHeight
            }
            enableResizing.value = true
          })
        })
        .catch(err => {
          if (err instanceof NewTootAttachLength) {
            ElMessage({
              message: i18n.t('validation.new_toot.attach_length', { max: 4 }),
              type: 'error'
            })
          } else {
            ElMessage({
              message: i18n.t('message.attach_error'),
              type: 'error'
            })
          }
        })
    }
    const onChangeImage = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.item(0)
      if (file === null || file === undefined) {
        return
      }
      if (!file.type.includes('image') && !file.type.includes('video')) {
        ElMessage({
          message: i18n.t('validation.new_toot.attach_image'),
          type: 'error'
        })
        return
      }
      updateImage(file)
    }
    const onPaste = (e: Event) => {
      const mimeTypes = (window as any).clipboard.availableFormats().filter(t => t.startsWith('image'))
      if (mimeTypes.length === 0) {
        return
      }
      e.preventDefault()
      const image = (window as any).clipboard.readImage()
      let data: any
      if (/^image\/jpe?g$/.test(mimeTypes[0])) {
        data = image.toJPEG(100)
      } else {
        data = image.toPNG()
      }
      const file = new File([data], 'clipboard.picture', { type: mimeTypes[0] })
      updateImage(file)
    }
    const removeAttachment = (media: Entity.Attachment) => {
      const previousHeight = previewRef!.value!.offsetHeight
      store.dispatch(`${space}/${ACTION_TYPES.REMOVE_MEDIA}`, media).then(() => {
        enableResizing.value = false
        nextTick(() => {
          if (attachedMedias.value.length === 0) {
            statusHeight.value = statusHeight.value + previousHeight
          }
          enableResizing.value = true
        })
      })
    }
    const changeVisibility = (level: number) => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_VISIBILITY_VALUE}`, level)
    }
    const changeSensitive = () => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_SENSITIVE}`, !sensitive.value)
    }
    const closeConfirm = (done: Function) => {
      if (!newTootModal.value) return
      if (statusRef.value?.suggestOpened) return
      if (statusText.value.length === 0) {
        done()
      } else {
        ElMessageBox.confirm(i18n.t('modals.new_toot.close_confirm'), {
          confirmButtonText: i18n.t('modals.new_toot.close_confirm_ok'),
          cancelButtonText: i18n.t('modals.new_toot.close_confirm_cancel')
        })
          .then(_ => {
            done()
          })
          .catch(_ => {})
      }
    }
    const updateDescription = (id: number, value: string) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_MEDIA_DESCRIPTION}`, { id: id, description: value })
    }
    const togglePollForm = () => {
      const previousHeight = pollRef.value ? pollRef.value.$el.offsetHeight : 0
      const toggle = () => {
        openPoll.value = !openPoll.value
        if (openPoll.value) {
          polls.value = ['', '']
        } else {
          polls.value = []
        }
      }
      enableResizing.value = false
      toggle()
      nextTick(() => {
        if (openPoll.value) {
          const currentHeight = pollRef.value ? pollRef.value.$el.offsetHeight : 0
          statusHeight.value = statusHeight.value - currentHeight
        } else {
          statusHeight.value = statusHeight.value + previousHeight
        }
        enableResizing.value = true
      })
    }
    const addPoll = () => {
      enableResizing.value = false
      polls.value.push('')
      nextTick(() => {
        enableResizing.value = true
      })
    }
    const removePoll = (id: number) => {
      enableResizing.value = false
      polls.value.splice(id, 1)
      nextTick(() => {
        enableResizing.value = true
      })
    }
    const toggleContentWarning = () => {
      const previousHeight = spoilerRef.value ? spoilerRef.value.offsetHeight : 0
      enableResizing.value = false
      showContentWarning.value = !showContentWarning.value
      nextTick(() => {
        if (showContentWarning.value) {
          if (spoilerRef.value) {
            statusHeight.value = statusHeight.value - spoilerRef.value.offsetHeight
          }
        } else {
          statusHeight.value = statusHeight.value + previousHeight
        }
        enableResizing.value = true
      })
    }
    const handleResize = (event: { width: number; height: number }) => {
      if (!enableResizing.value) return
      const dialog = document.getElementsByClassName('new-toot-modal').item(0) as HTMLElement
      if (!dialog) return
      const dialogStyle = window.getComputedStyle(dialog, null)
      // Ignore when the modal height already reach window height.
      const marginTop = dialogStyle.marginTop
      const limitHeight = document.documentElement.clientHeight - parseInt(marginTop) - 80
      if (dialog.offsetHeight >= limitHeight) {
        return
      }
      const pollHeight = pollRef.value ? pollRef.value.$el.offsetHeight : 0
      const spoilerHeight = spoilerRef.value ? spoilerRef.value.offsetHeight : 0
      const quoteHeight = quoteRef.value ? quoteRef.value.$el.offsetHeight : 0
      const previewHeight = previewRef.value ? previewRef.value.offsetHeight : 0
      const headerHeight = 54
      const footerHeight = 66
      statusHeight.value = event.height - footerHeight - headerHeight - previewHeight - pollHeight - spoilerHeight - quoteHeight
    }

    return {
      visibilityList,
      statusText,
      spoilerText,
      showContentWarning,
      openPoll,
      polls,
      pollExpire,
      statusHeight,
      // DOM refs
      previewRef,
      imageRef,
      pollRef,
      spoilerRef,
      quoteRef,
      statusRef,
      // computed
      quoteToMessage,
      attachedMedias,
      mediaDescriptions,
      blockSubmit,
      sensitive,
      visibilityIcon,
      loading,
      tootMax,
      displayNameStyle,
      hashtagInserting,
      newTootModal,
      pinedHashtag,
      // methods
      close,
      toot,
      selectImage,
      onChangeImage,
      onPaste,
      removeAttachment,
      changeVisibility,
      changeSensitive,
      closeConfirm,
      updateDescription,
      togglePollForm,
      addPoll,
      removePoll,
      toggleContentWarning,
      handleResize
    }
  },
  methods: {}
})
</script>

<style lang="scss" scoped>
.new-toot :deep() {
  .new-toot-modal {
    background-color: var(--theme-selected-background-color);
    overflow: hidden;
    resize: both;
    padding-bottom: 20px;
    max-height: calc(100% - 15vh - 80px);
    max-width: 95%;

    .el-dialog__header {
      background-color: #4a5664;
      margin-right: 0;

      .el-dialog__title {
        color: #ebeef5;
      }
    }

    .el-dialog__body {
      padding: 0;

      .el-input__inner {
        background-color: var(--theme-background-color);
        color: var(--theme-primary-color);
        border: 1px solid var(--theme-border-color);
      }

      .spoiler {
        box-sizing: border-box;
        padding: 4px 0;
        background-color: #4a5664;

        input {
          border-radius: 0;

          &::placeholder {
            color: #c0c4cc;
          }
        }
      }

      .preview {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .image-wrapper {
          position: relative;
          flex: 1 1 0;
          min-width: 10%;
          height: 150px;
          margin: 4px;

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border: 0;
            border-radius: 8px;
          }

          .image-description {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            box-sizing: border-box;
            border: 0;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0, rgba(0, 0, 0, 0.35) 80%, transparent);
            font-size: var(--font-base-size);
            color: #fff;
            opacity: 1;
            resize: none;
            overflow: scroll;

            &::placeholder {
              color: #c0c4cc;
            }
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
    }

    .el-dialog__footer {
      background-color: var(--theme-selected-background-color);
      font-size: var(--base-font-size);
      padding-bottom: 0;

      .upload-image {
        text-align: left;
        float: left;

        .image-input {
          display: none;
        }
      }

      .poll {
        float: left;
        margin-left: 8px;
      }

      .privacy {
        float: left;
        margin-left: 8px;
      }

      .sensitive {
        float: left;
        margin-left: 8px;
      }

      .content-warning {
        float: left;
        margin-left: 8px;

        .cw-text {
          font-weight: 800;
          line-height: 18px;
        }
      }

      .pined-hashtag {
        float: left;
        margin-left: 8px;
      }

      .clickable {
        color: #909399;
      }

      .info {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .loading {
          width: 18px;
          margin-right: 4px;
        }

        .text-count {
          padding-right: 10px;
          color: #909399;
        }
      }

      .toot-action {
        font-size: var(--base-font-size);
        margin-top: 2px;
        margin-bottom: 2px;
      }
    }
  }
}

.privacy-icon {
  margin-right: 4px;
}
</style>
