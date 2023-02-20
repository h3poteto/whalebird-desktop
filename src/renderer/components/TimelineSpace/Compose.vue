<template>
  <div class="compose">
    <Quote v-if="inReplyTo" :message="inReplyTo" @close="clearReply" />
    <Quote v-if="quoteTo" :message="quoteTo" @close="clearQuote" />
    <el-form :model="form" class="compose-form">
      <el-popover
        placement="top-start"
        width="300"
        trigger="manual"
        popper-class="suggest-popper"
        :popper-options="popperOptions()"
        ref="suggestRef"
        v-model:visible="suggestOpened"
      >
        <ul class="suggest-list">
          <li
            v-for="(item, index) in filteredSuggestion"
            :key="index"
            @click="insertItem(item)"
            @mouseover="suggestHighlight(index)"
            :class="{ highlighted: highlightedIndex === index }"
          >
            <span v-if="item.image">
              <img :src="item.image" class="icon" />
            </span>
            <span v-if="item.code">
              {{ item.code }}
            </span>
            {{ item.name }}
          </li>
        </ul>
        <template #reference>
          <el-input v-model="form.spoiler" class="spoiler" :placeholder="$t('compose.cw')" v-if="cw" />
          <el-input v-model="form.status" type="textarea" :autosize="{ minRows: 2 }" :placeholder="$t('compose.status')" ref="statusRef" />
        </template>
      </el-popover>
      <div class="preview" ref="previewRef">
        <div class="image-wrapper" v-for="media in attachments" :key="media.id">
          <img :src="media.preview_url" class="preview-image" />
          <el-button class="remove-image" link @click="removeAttachment(media)"><font-awesome-icon icon="circle-xmark" /></el-button>
        </div>
      </div>
      <div class="nsfw" v-if="attachments.length > 0">
        <el-checkbox v-model="nsfw">{{ $t('compose.footer.change_sensitive') }}</el-checkbox>
      </div>
      <div class="poll" v-if="poll.options.length > 0">
        <ul class="options-list">
          <li class="option" v-for="(_, index) in poll.options" :key="index">
            <el-radio :disabled="true" :label="index">
              <el-input :placeholder="`Choice ${index}`" v-model="poll.options[index]" size="small"></el-input>
              <el-button class="remove-poll" link size="small" @click="removePollOption(index)"
                ><font-awesome-icon icon="xmark"
              /></el-button>
            </el-radio>
          </li>
        </ul>
        <el-button class="add-poll" type="info" size="small" @click="addPollOption">{{ $t('compose.poll.add_choice') }}</el-button>
        <el-select v-model="poll.expires_in" size="small" value-key="value">
          <el-option v-for="exp in expiresList" :key="exp.value" :label="exp.label" :value="exp.value"> </el-option>
        </el-select>
      </div>
      <div class="form-footer">
        <el-button-group class="tool-buttons">
          <el-button link size="default" @click="selectImage">
            <font-awesome-icon icon="camera" />
          </el-button>
          <input name="image" type="file" class="image-input" ref="imageRef" @change="onChangeImage" />
          <el-button link size="default" @click="togglePoll">
            <font-awesome-icon icon="square-poll-horizontal" />
          </el-button>
          <div>
            <el-dropdown trigger="click" @command="changeVisibility">
              <el-button size="default" link :title="$t('compose.footer.change_visibility')">
                <font-awesome-icon :icon="visibilityIcon" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="visibilityList.Public.key">
                    <font-awesome-icon icon="globe" class="privacy-icon" />
                    {{ $t(visibilityList.Public.name) }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="visibilityList.Unlisted.key">
                    <font-awesome-icon icon="unlock" class="privacy-icon" />
                    {{ $t(visibilityList.Unlisted.name) }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="visibilityList.Private.key">
                    <font-awesome-icon icon="lock" class="privacy-icon" />
                    {{ $t(visibilityList.Private.name) }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="visibilityList.Direct.key">
                    <font-awesome-icon icon="envelope" class="privacy-icon" size="sm" />
                    {{ $t(visibilityList.Direct.name) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-popover placement="top" width="0" :visible="emojiVisible" popper-class="new-toot-emoji-picker">
            <picker
              v-if="emojiData !== null"
              :data="emojiData"
              set="twitter"
              :autoFocus="true"
              @select="selectEmoji"
              :perLine="7"
              :emojiSize="24"
              :showPreview="false"
              :emojiTooltip="true"
            />
            <template #reference>
              <el-button link size="default" @click="emojiVisible = !emojiVisible">
                <font-awesome-icon :icon="['far', 'face-smile']" />
              </el-button>
            </template>
          </el-popover>
          <el-button link size="default" @click="cw = !cw"> CW </el-button>
        </el-button-group>
        <div class="actions-group">
          <span>{{ statusChars }}</span>
          <el-button type="primary" @click="post" :loading="loading"> {{ $t('compose.toot') }} </el-button>
        </div>
      </div>
    </el-form>
    <receive-drop v-if="droppableVisible"></receive-drop>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import emojiDefault from 'emoji-mart-vue-fast/data/all.json'
import { Picker, EmojiIndex, EmojiData } from 'emoji-mart-vue-fast/src'
import { useI18next } from 'vue3-i18next'
import { ElMessage } from 'element-plus'
import { useStore } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import visibilityList from '~/src/constants/visibility'
import { MUTATION_TYPES } from '@/store/TimelineSpace/Compose'
import ReceiveDrop from './ReceiveDrop.vue'
import Quote from './Compose/Quote.vue'
import suggestText from '@/utils/suggestText'

type Expire = {
  label: string
  value: number
}

type SuggestItem = {
  name: string
  image?: string
  code?: string
}

export default defineComponent({
  name: 'Compose',
  components: { Picker, ReceiveDrop, Quote },
  setup() {
    const route = useRoute()
    const store = useStore()
    const i18n = useI18next()
    const space = 'TimelineSpace/Compose'
    const win = (window as any) as MyWindow

    const id = computed(() => parseInt(route.params.id as string))
    const userAgent = computed(() => store.state.App.userAgent)
    const visibilityIcon = computed(() => {
      switch (visibility.value) {
        case visibilityList.Public.key:
          return 'globe'
        case visibilityList.Unlisted.key:
          return 'unlock'
        case visibilityList.Private.key:
          return 'lock'
        case visibilityList.Direct.key:
          return 'envelope'
        default:
          return 'globe'
      }
    })
    const expiresList = reactive<Array<Expire>>([
      {
        label: i18n.t('compose.poll.expires.5_minutes'),
        value: 60 * 5
      },
      {
        label: i18n.t('compose.poll.expires.30_minutes'),
        value: 60 * 30
      },
      {
        label: i18n.t('compose.poll.expires.1_hour'),
        value: 3600
      },
      {
        label: i18n.t('compose.poll.expires.6_hours'),
        value: 3600 * 6
      },
      {
        label: i18n.t('compose.poll.expires.1_day'),
        value: 3600 * 24
      },
      {
        label: i18n.t('compose.poll.expires.3_days'),
        value: 3600 * 24 * 3
      },
      {
        label: i18n.t('compose.poll.expires.7_days'),
        value: 3600 * 24 * 7
      }
    ])

    const emojiData = ref<EmojiIndex | null>(null)
    const client = ref<MegalodonInterface | null>(null)
    const form = reactive({
      status: '',
      spoiler: ''
    })
    const attachments = ref<Array<Entity.Attachment | Entity.AsyncAttachment>>([])
    const cw = ref<boolean>(false)
    const visibility = ref(visibilityList.Public.key)
    const nsfw = ref<boolean>(false)
    const inReplyTo = computed(() => store.state.TimelineSpace.Compose.inReplyTo)
    const quoteTo = computed(() => store.state.TimelineSpace.Compose.quoteTo)
    const poll = reactive<{ options: Array<string>; expires_in: number }>({
      options: [],
      expires_in: 86400
    })

    const loading = ref<boolean>(false)
    const emojiVisible = ref<boolean>(false)
    const imageRef = ref<any>(null)
    const statusRef = ref<any>(null)

    const dropTarget = ref<any>(null)
    const droppableVisible = ref<boolean>(false)

    const maxStatusChars = ref<number>(500)
    const statusChars = computed(() => maxStatusChars.value - (form.status.length + form.spoiler.length))

    const suggestOpened = ref<boolean>(false)
    const filteredSuggestion = ref<Array<SuggestItem>>([])
    const highlightedIndex = ref(0)
    const startIndex = ref(0)
    const matchWord = ref('')

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      const c = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      client.value = c

      const credentials = await c.verifyAccountCredentials()
      if (credentials.data.source) {
        visibility.value = credentials.data.source.privacy
        nsfw.value = credentials.data.source.sensitive
      }

      const instance = await c.getInstance()
      if (instance.data.max_toot_chars) {
        maxStatusChars.value = instance.data.max_toot_chars
      }

      const emojis = await c.getInstanceCustomEmojis()
      const customEmojis = emojis.data
        .map(emoji => {
          return {
            name: `:${emoji.shortcode}:`,
            image: emoji.url
          }
        })
        .filter((e, i, array) => {
          return array.findIndex(ar => e.name === ar.name) === i
        })
        .map(e => ({
          name: e.name,
          short_names: [e.name],
          text: e.name,
          emoticons: [],
          keywords: [e.name],
          imageUrl: e.image
        }))
      emojiData.value = new EmojiIndex(emojiDefault, { custom: customEmojis })
      ;(window as any).addEventListener('dragenter', onDragEnter)
      ;(window as any).addEventListener('dragleave', onDragLeave)
      ;(window as any).addEventListener('dragover', onDragOver)
      ;(window as any).addEventListener('drop', handleDrop)
    })

    onBeforeUnmount(() => {
      ;(window as any).removeEventListener('dragenter', onDragEnter)
      ;(window as any).removeEventListener('dragleave', onDragLeave)
      ;(window as any).removeEventListener('dragover', onDragOver)
      ;(window as any).removeEventListener('drop', handleDrop)
    })

    watch(inReplyTo, current => {
      if (current) {
        form.status = `@${current.account.acct} `
      }
    })

    watch(form, async current => {
      await suggest(current.status)
    })

    const post = async () => {
      if (!client.value) {
        return
      }

      // Validation
      if (form.status.length < 1 || form.status.length + form.spoiler.length > maxStatusChars.value) {
        ElMessage({
          message: i18n.t('validation.compose.toot_length', {
            min: 1,
            max: maxStatusChars.value
          }),
          type: 'error'
        })
        return
      }
      if (attachments.value.length > 4) {
        ElMessage({
          message: i18n.t('validation.compose.attach_length', {
            max: 4
          }),
          type: 'error'
        })
        return
      }
      if (poll.options.length > 0) {
        let mes: Array<any> = []
        poll.options.forEach(option => {
          if (option.length < 1) {
            mes = [
              ...mes,
              {
                message: i18n.t('validation.compose.poll_invalid'),
                type: 'error'
              }
            ]
          }
        })
        if (mes.length > 0) {
          ElMessage(mes[0])
          return
        }
      }

      // Post
      let options = {
        visibility: visibility.value
      }
      try {
        loading.value = true
        if (attachments.value.length > 0) {
          options = Object.assign(options, {
            media_ids: attachments.value.map(m => m.id)
          })
          if (nsfw.value) {
            options = Object.assign(options, {
              sensitive: nsfw.value
            })
          }
        }
        if (form.spoiler.length > 0) {
          options = Object.assign(options, {
            spoiler_text: form.spoiler
          })
        }
        if (inReplyTo.value) {
          options = Object.assign(options, {
            in_reply_to_id: inReplyTo.value?.id
          })
        }
        if (quoteTo.value) {
          options = Object.assign(options, {
            quote_id: quoteTo.value?.id
          })
        }

        if (poll.options.length > 0) {
          options = Object.assign(options, {
            poll: poll
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
      form.spoiler = ''
      attachments.value = []
      cw.value = false
      emojiVisible.value = false
      store.commit(`${space}/${MUTATION_TYPES.CLEAR_REPLY_TO_ID}`)
      poll.options = []
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

    const selectEmoji = emoji => {
      if (!statusRef.value) {
        return
      }
      const current = statusRef.value?.textarea.selectionStart
      if (emoji.native) {
        form.status = form.status.slice(0, current) + emoji.native + form.status.slice(current)
      } else {
        form.status = form.status.slice(0, current) + emoji.name + form.status.slice(current)
      }
      emojiVisible.value = false
    }

    const changeVisibility = (value: 'public' | 'unlisted' | 'private' | 'direct') => {
      visibility.value = value
    }

    const togglePoll = () => {
      if (poll.options.length > 0) {
        poll.options = []
      } else {
        poll.options = ['', '']
      }
    }

    const addPollOption = () => {
      poll.options = [...poll.options, '']
    }

    const removePollOption = (index: number) => {
      poll.options = poll.options.filter((_, i) => i !== index)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      droppableVisible.value = false
      if (e.dataTransfer?.files.item(0) === null || e.dataTransfer?.files.item(0) === undefined) {
        return false
      }
      const file = e.dataTransfer?.files.item(0)
      if (file === null || (!file.type.includes('image') && !file.type.includes('video'))) {
        ElMessage({
          message: i18n.t('validation.compose.attach_image'),
          type: 'error'
        })
        return false
      }
      uploadImage(file).catch(err => {
        console.error(err)
        ElMessage({
          message: i18n.t('message.attach_error'),
          type: 'error'
        })
      })
      return false
    }
    const onDragEnter = (e: DragEvent) => {
      if (e.dataTransfer && e.dataTransfer.types.indexOf('Files') >= 0) {
        dropTarget.value = e.target
        droppableVisible.value = true
      }
    }
    const onDragLeave = (e: DragEvent) => {
      if (e.target === dropTarget.value) {
        droppableVisible.value = false
      }
    }
    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const clearReply = () => {
      store.commit(`${space}/${MUTATION_TYPES.CLEAR_REPLY_TO_ID}`)
    }

    const clearQuote = () => {
      store.commit(`${space}/${MUTATION_TYPES.CLEAR_QUOTE_TO}`)
    }

    const popperOptions = () => {
      const element = document.querySelector('#status_textarea')
      return {
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: element,
              rootBoundary: 'viewport',
              altBoundary: true
            }
          }
        ]
      }
    }

    const suggestHighlight = (index: number) => {
      if (index < 0) {
        highlightedIndex.value = 0
      } else if (index >= filteredSuggestion.value.length) {
        highlightedIndex.value = filteredSuggestion.value.length - 1
      } else {
        highlightedIndex.value = index
      }
    }

    const insertItem = (item: SuggestItem) => {
      if (!item) return
      if (item.code) {
        const str = `${form.status.slice(0, startIndex.value - 1)}${item.code} ${form.status.slice(
          startIndex.value + matchWord.value.length
        )}`
        form.status = str
      } else {
        const str = `${form.status.slice(0, startIndex.value - 1)}${item.name} ${form.status.slice(
          startIndex.value + matchWord.value.length
        )}`
        form.status = str
      }
      closeSuggest()
    }

    const closeSuggest = () => {
      highlightedIndex.value = 0
      suggestOpened.value = false
      filteredSuggestion.value = []
    }

    const suggestEmoji = async (start: number, word: string) => {
      try {
        const find: Array<EmojiData> = emojiData.value.search(word.replace(':', ''))
        startIndex.value = start
        matchWord.value = word
        filteredSuggestion.value = find.map(e => {
          if (e.native) {
            return {
              name: e.colons,
              code: e.native
            }
          } else {
            return {
              name: e.id,
              image: e.imageUrl
            }
          }
        })
        suggestOpened.value = true
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    }

    const suggestAccount = async (start: number, word: string) => {
      if (!client.value) {
        return
      }
      try {
        const result = await client.value.searchAccount(word.replace('@', ''))
        startIndex.value = start
        matchWord.value = word
        filteredSuggestion.value = result.data.map(a => ({
          name: `@${a.acct}`
        }))
        suggestOpened.value = true
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    }

    const suggestHashtag = async (start: number, word: string) => {
      if (!client.value) {
        return
      }
      try {
        const result = await client.value.search(word, 'hashtags')
        startIndex.value = start
        matchWord.value = word
        filteredSuggestion.value = result.data.hashtags.map(tag => ({ name: `#${tag.name}` }))
        suggestOpened.value = true
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    }

    const suggest = async (current: string) => {
      const target = statusRef.value.textarea as HTMLInputElement
      // e.target.sectionStart: Cursor position
      // e.target.value: current value of the textarea
      if (current !== target.value) {
        return
      }
      if (!target.selectionStart) {
        return
      }
      const [start, word] = suggestText(target.value, target.selectionStart)
      if (!start || !word) {
        closeSuggest()
        return false
      }
      switch (word.charAt(0)) {
        case ':':
          await suggestEmoji(start, word)
          return true
        case '@':
          await suggestAccount(start, word)
          return true
        case '#':
          await suggestHashtag(start, word)
          return true
        default:
          return false
      }
    }

    return {
      form,
      post,
      imageRef,
      selectImage,
      onChangeImage,
      loading,
      attachments,
      removeAttachment,
      emojiData,
      selectEmoji,
      statusRef,
      emojiVisible,
      cw,
      visibilityList,
      visibilityIcon,
      changeVisibility,
      nsfw,
      poll,
      togglePoll,
      expiresList,
      addPollOption,
      removePollOption,
      droppableVisible,
      inReplyTo,
      quoteTo,
      clearReply,
      clearQuote,
      statusChars,
      suggestOpened,
      popperOptions,
      filteredSuggestion,
      suggestHighlight,
      insertItem,
      highlightedIndex,
      suggest
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

    .spoiler {
      padding-bottom: 8px;
    }
  }

  .compose-form :deep(.el-textarea__inner) {
    color: var(--theme-primary-color);
    background-color: var(--theme-background-color);
    box-shadow: 0 0 0 1px var(--theme-border-color, var(--theme-border-color)) inset;
  }

  .compose-form :deep(.el-input__wrapper) {
    background-color: var(--theme-background-color);
    box-shadow: 0 0 0 1px var(--theme-border-color, var(--theme-border-color)) inset;
  }

  .compose-form :deep(.el-input__inner) {
    color: var(--theme-primary-color);
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

  .poll {
    .options-list {
      list-style: none;
      padding-left: 16px;

      .poll-option {
        line-height: 38px;

        .remove-poll {
          margin-left: 4px;
        }
      }
    }

    .add-poll {
      margin: 0 4px 0 40px;
    }
  }

  .poll :deep(.el-input__inner) {
    box-shadow: none;
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;

    .tool-buttons {
      display: flex;

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

.privacy-icon {
  margin-right: 4px;
}
</style>

<style lang="scss">
.new-toot-emoji-picker {
  background-color: transparent !important;
  border: none !important;

  .el-popper__arrow {
    display: none;
  }
}

.suggest-popper {
  // These color is not applied because popper append outside of app.
  background-color: var(--theme-background-color);
  border: 1px solid var(--theme-header-menu-color);

  .suggest-list {
    list-style: none;
    padding: 6px 0;
    margin: 0;
    box-sizing: border-box;

    li {
      font-size: var(--base-font-size);
      padding: 0 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 34px;
      line-height: 34px;
      box-sizing: border-box;
      cursor: pointer;
      color: var(--theme-regular-color);

      .icon {
        display: inline-block;
        vertical-align: middle;
        width: 20px;
        height: 20px;
      }
    }

    .highlighted {
      background-color: var(--theme-selected-background-color);
    }
  }
}
</style>
