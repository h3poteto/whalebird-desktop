<template>
<div
  class="follow"
  tabIndex="0"
  v-shortkey="shortcutEnabled ? {next: ['j'], prev: ['k'], right: ['l'], profile: ['p']} : {}"
  @shortkey="handleStatusControl"
  ref="status"
  @click="$emit('select')"
  role="article"
  aria-label="follow event"
  >
  <div class="action">
    <div class="action-mark">
      <icon name="user-plus" scale="0.7"></icon>
    </div>
    <div class="action-detail">
      <span class="bold" @click="openUser(message.account)"><bdi v-html="username(message.account)"></bdi></span> is now following you
    </div>
    <div class="action-icon" role="presentation">
      <FailoverImg :src="message.account.avatar" />
    </div>
  </div>
  <div class="clearfix"></div>
  <div class="fill-line"></div>
</div>
</template>

<script>
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'
import emojify from '~/src/renderer/utils/emojify'

export default {
  name: 'follow',
  components: {
    FailoverImg
  },
  props: {
    message: {
      type: Object,
      default: {}
    },
    focused: {
      type: Boolean,
      default: false
    },
    overlaid: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    shortcutEnabled: function () {
      return this.focused && !this.overlaid
    }
  },
  mounted () {
    if (this.focused) {
      this.$refs.status.focus()
    }
  },
  watch: {
    focused: function (newState, oldState) {
      if (newState) {
        this.$nextTick(function () {
          this.$refs.status.focus()
        })
      } else if (oldState && !newState) {
        this.$nextTick(function () {
          this.$refs.status.blur()
        })
      }
    }
  },
  methods: {
    username (account) {
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.username
      }
    },
    openUser (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    handleStatusControl (event) {
      switch (event.srcKey) {
        case 'next':
          this.$emit('focusNext')
          break
        case 'prev':
          this.$emit('focusPrev')
          break
        case 'right':
          this.$emit('focusRight')
          break
        case 'profile':
          this.openUser(this.message.account)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bold {
  font-weight: bold;
}

.follow {
  padding: 8px 0 0 16px;

  .action {
    margin-right: 8px;

    .action-mark {
      color: #409eff;
      float: left;
      width: 32px;
      text-align: right;
    }

    .action-detail {
      margin-left: 10px;
      font-size: var(--base-font-size);
      float: left;
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .bold /deep/ {
        cursor: pointer;

        .emojione {
          max-width: 14px;
          max-height: 14px;
        }
      }
    }

    .action-icon {
      width: 100%;
      text-align: right;

      img {
        width: 16px;
        height: 16px;
        border-radius: 2px;
      }
    }
  }

  .fill-line {
    height: 1px;
    background-color: var(--theme-border-color);
    margin: 4px 0 0;
  }
}

.follow:focus {
  background-color: var(--theme-selected-background-color);
  outline: 0;
}
</style>
