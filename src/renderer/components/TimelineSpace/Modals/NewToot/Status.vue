<template>
<div class="status">
  <textarea
    v-model="status"
    ref="status"
    v-shortkey="openSuggest ? {up: ['arrowup'], down: ['arrowdown'], enter: ['enter']} : {linux: ['ctrl', 'enter'], mac: ['meta', 'enter'], left: ['arrowleft'], right: ['arrowright']}"
    @shortkey="handleKey"
    v-on:input="startSuggest"
    :placeholder="$t('modals.new_toot.status')"
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
import { mapState } from 'vuex'
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
      openSuggest: false,
      highlightedIndex: 0,
      startIndex: null,
      matchWord: null
    }
  },
  computed: {
    ...mapState({
      filteredAccounts: state => state.TimelineSpace.Modals.NewToot.Status.filteredAccounts
    }),
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
      } else if (oldState && !newState) {
        this.closeSuggest()
      }
    }
  },
  methods: {
    startSuggest (e) {
      const currentValue = e.target.value
      // Start suggest after user stop writing
      setTimeout(() => {
        if (currentValue === this.status) {
          this.suggestAccount(e)
        }
      }, 500)
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
      } catch (err) {
        console.log(err)
      }
    },
    closeSuggest () {
      this.openSuggest = false
      this.startIndex = null
      this.matchWord = null
      this.highlightedIndex = 0
      this.$store.commit('TimelineSpace/Modals/NewToot/Status/clearFilteredAccounts')
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
      const str = `${this.status.slice(0, this.startIndex)}${account} ${this.status.slice(this.startIndex + this.matchWord.length)}`
      this.status = str
      this.closeSuggest()
    },
    selectCurrentAccount () {
      const account = this.filteredAccounts[this.highlightedIndex]
      this.insertAccount(account)
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
          this.selectCurrentAccount()
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
    }

    .highlighted {
      background-color: #f5f7fa;
    }
  }
}
</style>
