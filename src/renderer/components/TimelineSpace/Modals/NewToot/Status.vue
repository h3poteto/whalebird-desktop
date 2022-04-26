<template>
  <div class="status">
    <textarea
      v-model="status"
      ref="status"
      @paste="onPaste"
      v-on:input="startSuggest"
      :placeholder="$t('modals.new_toot.status')"
      role="textbox"
      contenteditable="true"
      aria-multiline="true"
      :style="`height: ${height}px`"
      autofocus
    >
    </textarea>
    <el-popover placement="bottom-start" width="300" trigger="manual" v-model:visible="openSuggest" popper-class="suggest-popper">
      <ul class="suggest-list">
        <li
          v-for="(item, index) in filteredSuggestion"
          :key="index"
          @click="insertItem(item)"
          @mouseover="highlightedIndex = index"
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
      <el-popover placement="bottom" width="281" trigger="click" popper-class="new-toot-emoji-picker" ref="new_toot_emoji_picker">
        <picker
          :data="emojiIndex"
          set="twitter"
          :autoFocus="true"
          @select="selectEmoji"
          :custom="pickerEmojis"
          :perLine="7"
          :emojiSize="24"
          :showPreview="false"
          :emojiTooltip="true"
        />
        <template #reference>
          <el-button class="emoji-selector" type="text">
            <font-awesome-icon :icon="['far', 'face-smile']" size="lg" />
          </el-button>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script>
import 'emoji-mart-vue-fast/css/emoji-mart.css'
import data from 'emoji-mart-vue-fast/data/all.json'
import { mapState, mapGetters } from 'vuex'
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src'
import suggestText from '@/utils/suggestText'

const emojiIndex = new EmojiIndex(data)

export default {
  name: 'status',
  components: {
    Picker
  },
  props: {
    value: {
      type: String
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
  data() {
    return {
      highlightedIndex: 0,
      openEmojiPicker: false,
      emojiIndex: emojiIndex
    }
  },
  computed: {
    ...mapState('TimelineSpace/Modals/NewToot/Status', {
      filteredAccounts: state => state.filteredAccounts,
      filteredHashtags: state => state.filteredHashtags,
      openSuggest: state => state.openSuggest,
      startIndex: state => state.startIndex,
      matchWord: state => state.matchWord,
      filteredSuggestion: state => state.filteredSuggestion
    }),
    ...mapGetters('TimelineSpace/Modals/NewToot/Status', ['pickerEmojis']),
    status: {
      get: function () {
        return this.value
      },
      set: function (value) {
        this.$emit('input', value)
      }
    }
  },
  mounted() {
    // When change account, the new toot modal is recreated.
    // So can not catch open event in watch.
    this.$refs.status.focus()
    if (this.fixCursorPos) {
      this.$refs.status.setSelectionRange(0, 0)
    }
  },
  watch: {
    opened: function (newState, oldState) {
      if (!oldState && newState) {
        this.$nextTick(function () {
          this.$refs.status.focus()
          if (this.fixCursorPos) {
            this.$refs.status.setSelectionRange(0, 0)
          }
        })
      } else if (oldState && !newState) {
        this.closeSuggest()
      }
    }
  },
  methods: {
    async startSuggest(e) {
      const currentValue = e.target.value
      // Start suggest after user stop writing
      setTimeout(async () => {
        if (currentValue === this.status) {
          await this.suggest(e)
        }
      }, 700)
    },
    async suggest(e) {
      // e.target.sectionStart: Cursor position
      // e.target.value: current value of the textarea
      const [start, word] = suggestText(e.target.value, e.target.selectionStart)
      if (!start || !word) {
        this.closeSuggest()
        return false
      }
      switch (word.charAt(0)) {
        case ':':
          await this.suggestEmoji(start, word)
          return true
        case '@':
          await this.suggestAccount(start, word)
          return true
        case '#':
          await this.suggestHashtag(start, word)
          return true
        default:
          return false
      }
    },
    async suggestAccount(start, word) {
      try {
        await this.$store.dispatch('TimelineSpace/Modals/NewToot/Status/suggestAccount', { word: word, start: start })
        this.$emit('suggestOpened', true)
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    },
    async suggestHashtag(start, word) {
      try {
        await this.$store.dispatch('TimelineSpace/Modals/NewToot/Status/suggestHashtag', { word: word, start: start })
        this.$emit('suggestOpened', true)
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    },
    suggestEmoji(start, word) {
      try {
        this.$store.dispatch('TimelineSpace/Modals/NewToot/Status/suggestEmoji', { word: word, start: start })
        this.$emit('suggestOpened', true)
        return true
      } catch (err) {
        this.closeSuggest()
        return false
      }
    },
    closeSuggest() {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/Status/closeSuggest')
      if (this.openSuggest) {
        this.highlightedIndex = 0
      }
      this.$emit('suggestOpened', false)
    },
    suggestHighlight(index) {
      if (index < 0) {
        this.highlightedIndex = 0
      } else if (index >= this.filteredSuggestion.length) {
        this.highlightedIndex = this.filteredSuggestion.length - 1
      } else {
        this.highlightedIndex = index
      }
    },
    insertItem(item) {
      if (item.code) {
        const str = `${this.status.slice(0, this.startIndex - 1)}${item.code} ${this.status.slice(this.startIndex + this.matchWord.length)}`
        this.status = str
      } else {
        const str = `${this.status.slice(0, this.startIndex - 1)}${item.name} ${this.status.slice(this.startIndex + this.matchWord.length)}`
        this.status = str
      }
      this.closeSuggest()
    },
    selectCurrentItem() {
      const item = this.filteredSuggestion[this.highlightedIndex]
      this.insertItem(item)
    },
    onPaste(e) {
      this.$emit('paste', e)
    },
    handleKey(event) {
      const current = event.target.selectionStart
      switch (event.srcKey) {
        case 'up':
          this.suggestHighlight(this.highlightedIndex - 1)
          break
        case 'down':
          this.suggestHighlight(this.highlightedIndex + 1)
          break
        case 'enter':
          this.selectCurrentItem()
          break
        case 'esc':
          this.closeSuggest()
          break
        case 'left':
          event.target.setSelectionRange(current - 1, current - 1)
          break
        case 'right':
          event.target.setSelectionRange(current + 1, current + 1)
          break
        case 'linux':
        case 'mac':
          this.$emit('toot')
          break
        default:
          return true
      }
    },
    toggleEmojiPicker() {
      this.openEmojiPicker = !this.openEmojiPicker
      this.$emit('pickerOpened', this.openEmojiPicker)
    },
    selectEmoji(emoji) {
      const current = this.$refs.status.selectionStart
      if (emoji.native) {
        this.status = `${this.status.slice(0, current)}${emoji.native} ${this.status.slice(current)}`
      } else {
        // Custom emoji don't have natvie code
        this.status = `${this.status.slice(0, current)}${emoji.name} ${this.status.slice(current)}`
      }
      this.hideEmojiPicker()
    }
  }
}
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
