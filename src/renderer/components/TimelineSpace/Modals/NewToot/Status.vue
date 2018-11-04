<template>
<div class="status">
  <textarea
    v-model="status"
    ref="status"
    v-shortkey="openSuggest ? {up: ['arrowup'], down: ['arrowdown'], enter: ['enter'], esc: ['esc']} : {linux: ['ctrl', 'enter'], mac: ['meta', 'enter'], left: ['arrowleft'], right: ['arrowright']}"
    @shortkey="handleKey"
    @paste="onPaste"
    v-on:input="startSuggest"
    :placeholder="$t('modals.new_toot.status')"
    role="textbox"
    autofocus>
  </textarea>
  <el-popover
    placement="bottom-start"
    width="300"
    trigger="manual"
    v-model="openSuggest">
    <ul class="suggest-list">
      <li
        v-for="(item, index) in filteredSuggestion"
        :key="index"
        @click="insertItem(item)"
        @shortkey="insertItem(item)"
        @mouseover="highlightedIndex = index"
        :class="{'highlighted': highlightedIndex === index}">
        <span v-if="item.image">
          <img :src="item.image" class="icon" />
        </span>
        <span v-if="item.code">
          {{ item.code }}
        </span>
        {{ item.name }}
      </li>
    </ul>
  </el-popover>
  <div  v-click-outside="hideEmojiPicker">
    <el-button type="text" class="emoji-selector" @click="toggleEmojiPicker">
      <icon name="regular/smile" scale="1.2"></icon>
    </el-button>
    <div v-show="openEmojiPicker" class="emoji-picker">
      <picker
        set="emojione"
        :autoFocus="true"
        :custom="pickerEmojis"
        @select="selectEmoji"
        />
    </div>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import emojilib from 'emojilib'
import { Picker } from 'emoji-mart-vue'
import ClickOutside from 'vue-click-outside'
import suggestText from '../../../../utils/suggestText'

export default {
  name: 'status',
  directives: {
    ClickOutside
  },
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
    }
  },
  data () {
    return {
      openSuggest: false,
      highlightedIndex: 0,
      startIndex: null,
      matchWord: null,
      filteredSuggestion: [],
      openEmojiPicker: false
    }
  },
  computed: {
    ...mapState({
      customEmojis: state => state.TimelineSpace.emojis
    }),
    ...mapState('TimelineSpace/Modals/NewToot/Status', {
      filteredAccounts: state => state.filteredAccounts,
      filteredHashtags: state => state.filteredHashtags
    }),
    ...mapGetters('TimelineSpace/Modals/NewToot/Status', [
      'pickerEmojis'
    ]),
    status: {
      get: function () {
        return this.value
      },
      set: function (value) {
        this.$emit('input', value)
      }
    }
  },
  mounted () {
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
        this.openEmojiPicker = false
      }
    }
  },
  methods: {
    startSuggest (e) {
      const currentValue = e.target.value
      // Start suggest after user stop writing
      setTimeout(() => {
        if (currentValue === this.status) {
          this.suggest(e)
        }
      }, 500)
    },
    async suggest (e) {
      const emoji = this.suggestEmoji(e)
      if (emoji) {
        return true
      }
      const ac = await this.suggestAccount(e)
      if (ac) {
        return true
      }
      const tag = await this.suggestHashtag(e)
      return tag
    },
    async suggestAccount (e) {
      // e.target.sectionStart: Cursor position
      // e.target.value: current value of the textarea
      const [start, word] = suggestText(e.target.value, e.target.selectionStart, '@')
      if (!start || !word) {
        this.closeSuggest()
        return false
      }
      try {
        await this.$store.dispatch('TimelineSpace/Modals/NewToot/Status/searchAccount', word)
        this.openSuggest = true
        this.startIndex = start
        this.matchWord = word
        this.filteredSuggestion = this.filteredAccounts
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    },
    async suggestHashtag (e) {
      const [start, word] = suggestText(e.target.value, e.target.selectionStart, '#')
      if (!start || !word) {
        this.closeSuggest()
        return false
      }
      try {
        await this.$store.dispatch('TimelineSpace/Modals/NewToot/Status/searchHashtag', word)
        this.openSuggest = true
        this.startIndex = start
        this.matchWord = word
        this.filteredSuggestion = this.filteredHashtags
        return true
      } catch (err) {
        console.log(err)
        return false
      }
    },
    suggestEmoji (e) {
      // e.target.sectionStart: Cursor position
      // e.target.value: current value of the textarea
      const [start, word] = suggestText(e.target.value, e.target.selectionStart, ':')
      if (!start || !word) {
        this.closeSuggest()
        return false
      }
      // Find native emojis
      const filteredEmojiName = emojilib.ordered.filter(emoji => `:${emoji}`.includes(word))
      const filteredNativeEmoji = filteredEmojiName.map((name) => {
        return {
          name: `:${name}:`,
          code: emojilib.lib[name].char
        }
      })
      // Find custom emojis
      const filteredCustomEmoji = this.customEmojis.filter(emoji => emoji.name.includes(word))
      const filtered = filteredNativeEmoji.concat(filteredCustomEmoji)
      if (filtered.length > 0) {
        this.openSuggest = true
        this.startIndex = start
        this.matchWord = word
        this.filteredSuggestion = filtered.filter((e, i, array) => {
          return (array.findIndex(ar => e.name === ar.name) === i)
        })
      } else {
        this.openSuggest = false
      }
      return true
    },
    closeSuggest () {
      this.openSuggest = false
      this.startIndex = null
      this.matchWord = null
      this.highlightedIndex = 0
      this.filteredSuggestion = []
      this.$store.commit('TimelineSpace/Modals/NewToot/Status/clearFilteredAccounts')
      this.$store.commit('TimelineSpace/Modals/NewToot/Status/clearFilteredHashtags')
    },
    suggestHighlight (index) {
      if (index < 0) {
        this.highlightedIndex = 0
      } else if (index >= this.filteredSuggestion.length) {
        this.highlightedIndex = this.filteredSuggestion.length - 1
      } else {
        this.highlightedIndex = index
      }
    },
    insertItem (item) {
      if (item.code) {
        const str = `${this.status.slice(0, this.startIndex - 1)}${item.code} ${this.status.slice(this.startIndex + this.matchWord.length)}`
        this.status = str
      } else {
        const str = `${this.status.slice(0, this.startIndex - 1)}${item.name} ${this.status.slice(this.startIndex + this.matchWord.length)}`
        this.status = str
      }
      this.closeSuggest()
    },
    selectCurrentItem () {
      const item = this.filteredSuggestion[this.highlightedIndex]
      this.insertItem(item)
    },
    onPaste (e) {
      this.$emit('paste', e)
    },
    handleKey (event) {
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
    toggleEmojiPicker () {
      this.openEmojiPicker = !this.openEmojiPicker
    },
    hideEmojiPicker () {
      this.openEmojiPicker = false
    },
    selectEmoji (emoji) {
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

<style lang="scss" scoped>
.status {
  position: relative;

  textarea {
    display: block;
    padding: 4px 32px 4px 16px;
    line-height: 1.5;
    box-sizing: border-box;
    width: 100%;
    font-size: inherit;
    color: #606266;
    background-image: none;
    border: 0;
    border-radius: 4px;
    resize: none;
    height: 120px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 9.355, 1);
    font-family: 'Bookerly', serif;

    &::placeholder {
      color: #c0c4cc;
    }

    &:focus {
      outline: 0;
    }
  }

  .suggest-list {
    list-style: none;
    padding: 6px 0;
    margin: 0;
    box-sizing: border-box;

    li {
      font-size: 14px;
      padding: 0 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #606266;
      height: 34px;
      line-height: 34px;
      box-sizing: border-box;
      cursor: pointer;

      .icon {
        display: inline-block;
        vertical-align: middle;
        width: 20px;
        height: 20px;
      }
    }

    .highlighted {
      background-color: #f5f7fa;
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
    top: 32px;
    left: 240px;
  }
}
</style>
