<template>
  <div class="notified-status">
    <div class="action">
      <div class="action-mark">
        <font-awesome-icon name="home" size="sm" />
      </div>
      <div class="action-detail">
        <span class="bold" @click="openUser(message.account)">
          <bdi
            v-html="
              $t('notification.status.body', {
                username: username(message.account),
                interpolation: { escapeValue: false },
              })
            "
          ></bdi>
        </span>
      </div>
      <div class="action-icon" role="presentation">
        <FailoverImg
          :src="message.account.avatar"
          :alt="`Avatar of ${message.account.username}`"
        />
      </div>
    </div>
    <div class="clearfix"></div>
    <toot
      :message="message.status"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      v-on:update="updateToot"
      v-on:delete="deleteToot"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
      @focusRight="$emit('focusRight')"
      @selectToot="$emit('select')"
    >
    </toot>
    <div class="clearfix"></div>
  </div>
</template>

<script>
import emojify from '~/src/renderer/utils/emojify'
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'
import Toot from '../Toot'

export default {
  name: 'mention',
  props: {
    message: {
      type: Object,
      default: {},
    },
    filters: {
      type: Array,
      default: [],
    },
    focused: {
      type: Boolean,
      default: false,
    },
    overlaid: {
      type: Boolean,
      default: false,
    },
  },
  components: { Toot, FailoverImg },
  methods: {
    updateToot(message) {
      return this.$emit('update', message)
    },
    deleteToot(message) {
      return this.$emit('delete', message)
    },
    username(account) {
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.username
      }
    },
    openUser(account) {
      this.$store.dispatch(
        'TimelineSpace/Contents/SideBar/openAccountComponent'
      )
      this.$store.dispatch(
        'TimelineSpace/Contents/SideBar/AccountProfile/changeAccount',
        account
      )
      this.$store.commit(
        'TimelineSpace/Contents/SideBar/changeOpenSideBar',
        true
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.bold {
  font-weight: bold;
}

.notified-status {
  padding-top: 8px;

  .action {
    padding: 0 0 0 16px;
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
}
</style>
