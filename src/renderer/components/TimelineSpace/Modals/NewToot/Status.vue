<template>
<div class="status">
  <textarea
    v-model="status"
    ref="status"
    v-shortkey="openSuggest ? {up: ['arrowup'], down: ['arrowdown'], enter: ['enter']} : {linux: ['ctrl', 'enter'], mac: ['meta', 'enter']}"
    @shortkey="handleKey"
    v-on:input="suggestAccount"
    placeholder="What is on your mind?"
    autofocus>
  </textarea>
  <el-popover
    placement="bottom-start"
    width="300"
    trigger="manual"
    v-model="openSuggest">
    <ul class="suggest-list">
      <li
        v-for="(item, index) in filteredAccounts"
        :key="index"
        @click="insertAccount(item)"
        @shortkey="insertAccount(item)"
        @mouseover="highlightedIndex = index"
        :class="{'highlighted': highlightedIndex === index}">
        {{ item }}
      </li>
    </ul>
  </el-popover>
</div>
</template>

<script>
import suggestText from '../../../../utils/suggestText'

export default {
  name: 'status',
  props: {
    value: {
      type: String
    },
    opened: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      accounts: [
        '@h3poteto@mstdn.io',
        '@h3_poteto@friends.nico',
        '@h3poteto@social.mikutter.hachune.net'
      ],
      filteredAccounts: [],
      openSuggest: false,
      highlightedIndex: 0,
      startIndex: null,
      matchWord: null
    }
  },
  computed: {
    status: {
      get: function () {
        return this.value
      },
      set: function (value) {
        this.$emit('input', value)
      }
    }
  },
  watch: {
    opened: function (newState, oldState) {
      if (!oldState && newState) {
        this.$nextTick(function () {
          this.$refs.status.focus()
        })
      }
    }
  },
  methods: {
    suggestAccount (e) {
      // e.target.sectionStart: Cursor position
      // e.target.value: current value of the textarea
      const [start, word] = suggestText(e.target.value, e.target.selectionStart, '@')
      if (!start || !word) {
        return false
      }
      this.filteredAccounts = this.accounts.filter((a) => a.startsWith(word))
      if (this.filteredAccounts.length === 0) {
        return false
      }
      this.openSuggest = true
      this.startIndex = start
      this.matchWord = word
    },
    suggestHighlight (index) {
      if (index < 0) {
        this.highlightedIndex = 0
      } else if (index >= this.filteredAccounts.length) {
        this.highlightedIndex = this.filteredAccounts.length - 1
      } else {
        this.highlightedIndex = index
      }
    },
    insertAccount (account) {
      console.log(account)
      const str = `${this.status.slice(0, this.startIndex - 1)}${account} ${this.status.slice(this.startIndex + this.matchWord.length)}`
      this.status = str
      this.openSuggest = false
      this.startIndex = null
      this.matchWord = null
    },
    selectCurrentAccount () {
      const account = this.filteredAccounts[this.highlightedIndex]
      this.insertAccount(account)
    },
    handleKey (event) {
      switch (event.srcKey) {
        case 'up':
          this.suggestHighlight(this.highlightedIndex - 1)
          break
        case 'down':
          this.suggestHighlight(this.highlightedIndex + 1)
          break
        case 'enter':
          this.selectCurrentAccount()
          break
        default:
          return true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status {
  textarea {
    display: block;
    padding: 5px 15px;
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
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    font-family: 'Lato', sans-serif;

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
    }

    .highlighted {
      background-color: #f5f7fa;
    }
  }
}
</style>
