<template>
  <div class="user" @click="openUser(user)" aria-label="user">
    <div class="icon" role="presentation">
      <FailoverImg :src="user.avatar" :alt="`Avatar of ${user.username}`" />
    </div>
    <div class="name">
      <div class="username">
        <bdi v-html="username(user)"></bdi>
      </div>
      <div class="acct">@{{ user.acct }}</div>
    </div>
    <div class="tool" v-if="remove">
      <el-button type="text" @click.stop.prevent="removeAccount(user)">
        <font-awesome-icon icon="xmark" />
      </el-button>
    </div>
    <div class="tool" v-if="relationship">
      <el-button
        v-if="relationship.following"
        class="unfollow"
        type="text"
        @click.stop.prevent="unfollowAccount(user)"
        :title="$t('side_bar.account_profile.unfollow')"
      >
        <font-awesome-icon icon="user-xmark" />
      </el-button>
      <el-button v-else-if="relationship.requested" class="requested" type="text" :title="$t('side_bar.account_profile.follow_requested')">
        <font-awesome-icon icon="hourglass" />
      </el-button>
      <el-button
        v-else-if="!relationship.following"
        class="follow"
        type="text"
        @click.stop.prevent="followAccount(user)"
        :title="$t('side_bar.account_profile.follow')"
      >
        <font-awesome-icon icon="user-plus" />
      </el-button>
    </div>
    <div class="tool" v-else-if="request">
      <el-button class="accept" type="text" @click.stop.prevent="acceptRequest(user)" :title="$t('follow_requests.accept')">
        <font-awesome-icon icon="check" />
      </el-button>
      <el-button class="reject" type="text" @click.stop.prevent="rejectRequest(user)" :tilte="$t('follow_requests.reject')">
        <font-awesome-icon icon="xmark" />
      </el-button>
    </div>
  </div>
</template>

<script>
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'
import emojify from '~/src/renderer/utils/emojify'

export default {
  name: 'user',
  components: {
    FailoverImg
  },
  props: {
    user: {
      type: Object,
      default: {}
    },
    remove: {
      type: Boolean,
      default: false
    },
    relationship: {
      type: Object,
      default: null
    },
    request: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    username(account) {
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.username
      }
    },
    openUser(account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    removeAccount(account) {
      this.$emit('removeAccount', account)
    },
    unfollowAccount(account) {
      this.$emit('unfollowAccount', account)
    },
    followAccount(account) {
      this.$emit('followAccount', account)
    },
    acceptRequest(account) {
      this.$emit('acceptRequest', account)
    },
    rejectRequest(account) {
      this.$emit('rejectRequest', account)
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  display: flex;
  box-sizing: border-box;
  padding: 8px 12px;
  border-bottom: 1px solid var(--theme-border-color);
  cursor: pointer;
  align-items: center;

  .fa-icon {
    font-size: 0.9em;
    width: auto;
    height: 1em;
    max-width: 100%;
    max-height: 100%;
  }

  .icon {
    float: left;

    img {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      display: block;
    }
  }

  .name {
    display: inline-block;
    padding-left: 8px;
    overflow: hidden;

    .username :deep(.emojione) {
      max-width: 1em;
      max-height: 1em;
    }

    .acct {
      color: #909399;
    }

    div {
      width: auto;
      word-wrap: break-word;
    }
  }

  .tool {
    margin-left: auto;

    .follow {
      color: var(--theme-primary-color);
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .unfollow {
      color: #409eff;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .requested {
      color: var(--theme-primary-color);
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .accept,
    .reject {
      margin-right: 24px;
    }
  }
}
</style>
