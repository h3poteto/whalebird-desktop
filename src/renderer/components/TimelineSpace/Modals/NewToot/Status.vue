<template>
  <div class="status">
    <textarea
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target?.value)"
      ref="statusRef"
      @paste="$emit('paste', $event)"
      v-on:input="startSuggest"
      :placeholder="$t('modals.new_toot.status')"
      role="textbox"
      contenteditable="true"
      aria-multiline="true"
      :style="`height: ${height}px`"
      v-focus
      autofocus
    >
    </textarea>
    <el-popover
      placement="bottom-start"
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
      <!-- dummy object to open suggest popper -->
      <template #reference>
        <span></span>
      </template>
    </el-popover>
    <div>
      <el-popover placement="bottom" width="281" trigger="click" popper-class="new-toot-emoji-picker">
        <picker
          :data="emojiIndex"
          set="twitter"
          :autoFocus="true"
          @select="selectEmoji"
          :perLine="7"
          :emojiSize="24"
          :showPreview="false"
          :emojiTooltip="true"
        />
        <template #reference>
          <el-button class="emoji-selector" link>
            <font-awesome-icon :icon="['far', 'face-smile']" size="lg" />
          </el-button>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script lang="ts">
import 'emoji-mart-vue-fast/css/emoji-mart.css'
import data from 'emoji-mart-vue-fast/data/all.json'
import { defineComponent, computed, toRefs, ref, onBeforeUnmount, onMounted, nextTick } from 'vue'
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src'
import { useMagicKeys, whenever } from '@vueuse/core'

import suggestText from '@/utils/suggestText'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Modals/NewToot/Status'

export default defineComponent({
  name: 'status',
  components: {
    Picker
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    opened: {
      type: Boolean,
      default: false
    },
    fixCursorPos: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 120
    }
  },
  emits: ['toot'],
  setup(props, ctx) {
    const space = 'TimelineSpace/Modals/NewToot/Status'
    const store = useStore()
    const { up, down, enter, escape, Ctrl_Enter, Cmd_Enter } = useMagicKeys({
      passive: false,
      onEventFired(e) {
        if (e.key === 'Enter' && suggestOpened.value) e.preventDefault()
        if (e.key === 'ArrowUp' && suggestOpened.value) e.preventDefault()
        if (e.key === 'ArrowDown' && suggestOpened.value) e.preventDefault()
      }
    })

    const { modelValue, fixCursorPos } = toRefs(props)
    const highlightedIndex = ref(0)
    const statusRef = ref<HTMLTextAreaElement>()
    const suggestRef = ref()
    const suggestOpened = ref<boolean>(false)

    const filteredAccounts = computed(() => store.state.TimelineSpace.Modals.NewToot.Status.filteredAccounts)
    const filteredHashtags = computed(() => store.state.TimelineSpace.Modals.NewToot.Status.filteredHashtags)
    const filteredSuggestion = computed(() => store.state.TimelineSpace.Modals.NewToot.Status.filteredSuggestion)
    const startIndex = computed(() => store.state.TimelineSpace.Modals.NewToot.Status.startIndex)
    const matchWord = computed(() => store.state.TimelineSpace.Modals.NewToot.Status.matchWord)
    const customEmojis = computed(() => store.getters[`${space}/pickerEmojis`])
    const emojiIndex = new EmojiIndex(data, {
      custom: customEmojis.value
    })

    whenever(up, () => {
      if (suggestOpened.value) suggestHighlight(highlightedIndex.value - 1)
    })
    whenever(down, () => {
      if (suggestOpened.value) suggestHighlight(highlightedIndex.value + 1)
    })
    whenever(enter, () => {
      if (suggestOpened.value) selectCurrentItem()
    })
    whenever(escape, () => {
      closeSuggest()
    })
    whenever(Ctrl_Enter, () => {
      ctx.emit('toot')
    })
    whenever(Cmd_Enter, () => {
      ctx.emit('toot')
    })

    onBeforeUnmount(() => {
      closeSuggest()
    })
    onMounted(() => {
      nextTick(() => {
        setTimeout(() => {
          statusRef.value?.focus()
          if (fixCursorPos.value) {
            statusRef.value?.setSelectionRange(0, 0)
          }
        }, 500)
      })
    })

    const openSuggest = () => {
      suggestOpened.value = true
    }
    const closeSuggest = () => {
      store.dispatch(`${space}/${ACTION_TYPES.CLOSE_SUGGEST}`)
      highlightedIndex.value = 0
      suggestOpened.value = false
    }
    const suggestAccount = async (start: number, word: string) => {
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.SUGGEST_ACCOUNT}`, { word: word, start: start })
        openSuggest()
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    }
    const suggestHashtag = async (start: number, word: string) => {
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.SUGGEST_HASHTAG}`, { word: word, start: start })
        openSuggest()
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    }
    const suggestEmoji = async (start: number, word: string) => {
      try {
        store.dispatch(`${space}/${ACTION_TYPES.SUGGEST_EMOJI}`, { word: word, start: start })
        openSuggest()
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    }
    const suggest = async (e: Event) => {
      const target = e.target as HTMLInputElement
      // e.target.sectionStart: Cursor position
      // e.target.value: current value of the textarea
      const [start, word] = suggestText(target.value, target.selectionStart!)
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
    const startSuggest = (e: Event) => {
      const currentValue = (e.target as HTMLInputElement).value
      // Start suggest after user stop writing
      setTimeout(async () => {
        if (currentValue === modelValue.value) {
          await suggest(e)
        }
      }, 700)
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
    const selectCurrentItem = () => {
      const item = filteredSuggestion.value[highlightedIndex.value]
      insertItem(item)
    }
    const insertItem = item => {
      if (!item) return
      if (item.code) {
        const str = `${modelValue.value.slice(0, startIndex.value - 1)}${item.code} ${modelValue.value.slice(
          startIndex.value + matchWord.value.length
        )}`
        ctx.emit('update:modelValue', str)
      } else {
        const str = `${modelValue.value.slice(0, startIndex.value - 1)}${item.name} ${modelValue.value.slice(
          startIndex.value + matchWord.value.length
        )}`
        ctx.emit('update:modelValue', str)
      }

      closeSuggest()
    }
    const selectEmoji = emoji => {
      const current = statusRef.value?.selectionStart
      if (emoji.native) {
        ctx.emit('update:modelValue', `${modelValue.value.slice(0, current)}${emoji.native} ${modelValue.value.slice(current)}`)
      } else {
        // Custom emoji don't have native code
        ctx.emit('update:modelValue', `${modelValue.value.slice(0, current)}${emoji.name} ${modelValue.value.slice(current)}`)
      }
      closeSuggest()
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

    return {
      statusRef,
      suggestRef,
      suggestOpened,
      emojiIndex,
      highlightedIndex,
      filteredAccounts,
      filteredHashtags,
      filteredSuggestion,
      startSuggest,
      suggestHighlight,
      insertItem,
      selectEmoji,
      popperOptions
    }
  }
})
</script>

<style lang="scss">
.suggest-popper {
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

<style lang="scss" scoped>
.status {
  position: relative;
  z-index: 1;
  font-size: var(--base-font-size);
  background-color: var(--theme-background-color);

  textarea {
    position: relative;
    display: block;
    padding: 4px 32px 4px 16px;
    line-height: 1.5;
    box-sizing: border-box;
    width: 100%;
    font-size: inherit;
    color: var(--theme-primary-color);
    background-image: none;
    border: 0;
    border-radius: 4px;
    resize: none;
    height: 120px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 9.355, 1);
    word-break: normal;
    background-color: var(--theme-background-color);

    &::placeholder {
      color: #c0c4cc;
    }

    &:focus {
      outline: 0;
    }
  }

  .emoji-selector {
    position: absolute;
    top: 4px;
    right: 8px;
    padding: 0;
  }

  .emoji-picker {
    position: absolute;
    top: 0;
    right: 32px;
  }
}
</style>
