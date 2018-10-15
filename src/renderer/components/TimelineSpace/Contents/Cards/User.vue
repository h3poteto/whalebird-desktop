<template>
<div class="user" @click="openUser(user)">
  <div class="icon">
    <img :src="user.avatar" />
  </div>
  <div class="name">
    <div class="username">
      {{ username(user) }}
    </div>
    <div class="acct">
      @{{ user.acct }}
    </div>
  </div>
  <div class="tool" v-if="remove">
    <el-button type="text" @click.stop.prevent="removeAccount(user)">
      <icon name="times"></icon>
    </el-button>
  </div>
  <div class="tool" v-if="relationship">
    <el-button v-if="relationship.following" class="unfollow" type="text" @click.stop.prevent="unfollowAccount(user)" :title="$t('side_bar.account_profile.unfollow')">
      <icon name="user-times"></icon>
    </el-button>
    <el-button v-else-if="relationship.requested" class="requested" type="text" :title="$t('side_bar.account_profile.follow_requested')">
      <icon name="hourglass"></icon>
    </el-button>
    <el-button v-else-if="!relationship.following" class="follow" type="text" @click.stop.prevent="followAccount(user)" :title="$t('side_bar.account_profile.follow')">
      <icon name="user-plus"></icon>
    </el-button>
  </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'user',
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
    }
  },
  methods: {
    username (account) {
      if (account.display_name !== '') {
        return account.display_name
      } else {
        return account.username
      }
    },
    openUser (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    removeAccount (account) {
      this.$emit('removeAccount', account)
    },
    unfollowAccount (account) {
      this.$emit('unfollowAccount', account)
    },
    followAccount (account) {
      this.$emit('followAccount', account)
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  display: flex;
  box-sizing: border-box;
  padding: 4px 12px 8px;
  border-bottom: 1px solid var(--theme-border-color);
  cursor: pointer;

  .icon {
    display: inline-block;

    img {
      width: 36px;
      height: 36px;
      border-radius: 4px;
    }
  }

  .name {
    display: inline-block;
    padding-left: 8px;

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
    }

    .unfollow {
      color: #409eff;
    }

    .requested {
      color: var(--theme-primary-color);
    }
  }
}
</style>
