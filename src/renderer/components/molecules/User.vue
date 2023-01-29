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
      <el-button link @click.stop.prevent="removeAccount(user)">
        <font-awesome-icon icon="xmark" />
      </el-button>
    </div>
    <div class="tool" v-if="relationship">
      <el-button
        v-if="relationship.following"
        class="unfollow"
        link
        @click.stop.prevent="unfollowAccount(user)"
        :title="$t('side_bar.account_profile.unfollow')"
      >
        <font-awesome-icon icon="user-xmark" />
      </el-button>
      <el-button v-else-if="relationship.requested" class="requested" link :title="$t('side_bar.account_profile.follow_requested')">
        <font-awesome-icon icon="hourglass" />
      </el-button>
      <el-button
        v-else-if="!relationship.following"
        class="follow"
        link
        @click.stop.prevent="followAccount(user)"
        :title="$t('side_bar.account_profile.follow')"
      >
        <font-awesome-icon icon="user-plus" />
      </el-button>
    </div>
    <div class="tool" v-else-if="request">
      <el-button class="accept" link :title="$t('follow_requests.accept')" @click.stop.prevent="acceptRequest(user)">
        <font-awesome-icon icon="check" />
      </el-button>
      <el-button class="reject" link :title="$t('follow_requests.reject')" @click.stop.prevent="rejectRequest(user)">
        <font-awesome-icon icon="xmark" />
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Entity } from 'megalodon'
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg.vue'
import emojify from '~/src/renderer/utils/emojify'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'user',
  components: {
    FailoverImg
  },
  props: {
    user: {
      type: Object as PropType<Entity.Account>,
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
  setup(_props, ctx) {
    const router = useRouter()
    const username = (account: Entity.Account) => {
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.username
      }
    }
    const openUser = (account: Entity.Account) => {
      router.push({ query: { detail: 'true', account_id: account.id } })
    }
    const removeAccount = (account: Entity.Account) => {
      ctx.emit('removeAccount', account)
    }
    const unfollowAccount = (account: Entity.Account) => {
      ctx.emit('unfollowAccount', account)
    }
    const followAccount = (account: Entity.Account) => {
      ctx.emit('followAccount', account)
    }
    const acceptRequest = (account: Entity.Account) => {
      ctx.emit('acceptRequest', account)
    }
    const rejectRequest = (account: Entity.Account) => {
      ctx.emit('rejectRequest', account)
    }

    return {
      username,
      openUser,
      removeAccount,
      unfollowAccount,
      followAccount,
      acceptRequest,
      rejectRequest
    }
  }
})
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
