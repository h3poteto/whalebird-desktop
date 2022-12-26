<template>
  <div
    id="account_profile"
    v-loading="loading"
    :element-loading-text="$t('message.loading')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    role="article"
    aria-label="account profile"
  >
    <div class="header-background" v-bind:style="{ backgroundImage: 'url(' + account?.header + ')' }">
      <div class="header">
        <div class="relationship" v-if="relationship !== null && !isOwnProfile">
          <div class="follower-status">
            <el-tag class="status" size="small" v-if="relationship.followed_by">{{ $t('side_bar.account_profile.follows_you') }}</el-tag>
            <el-tag class="status" size="default" v-else>{{ $t('side_bar.account_profile.doesnt_follow_you') }}</el-tag>
          </div>
          <div class="notify" v-if="relationship !== null && !isOwnProfile">
            <div
              v-if="relationship.notifying"
              class="unsubscribe"
              @click="unsubscribe(account)"
              :title="$t('side_bar.account_profile.unsubscribe')"
            >
              <font-awesome-icon icon="bell" size="lg" />
            </div>
            <div v-else class="subscribe" @click="subscribe(account)" :title="$t('side_bar.account_profile.subscribe')">
              <font-awesome-icon :icon="['far', 'bell']" size="lg" />
            </div>
          </div>
        </div>

        <div class="user-info">
          <div class="more" v-if="relationship !== null && !isOwnProfile">
            <el-popover placement="bottom" width="200" trigger="click" popper-class="account-menu-popper">
              <ul class="menu-list">
                <li role="button" @click="openBrowser(account)">
                  {{ $t('side_bar.account_profile.open_in_browser') }}
                </li>
                <li role="button" @click="addToList(account)">
                  {{ $t('side_bar.account_profile.manage_list_memberships') }}
                </li>
                <li role="button" @click="unmute(account)" v-if="muting">
                  {{ $t('side_bar.account_profile.unmute') }}
                </li>
                <li role="button" @click="confirmMute(account)" v-else>
                  {{ $t('side_bar.account_profile.mute') }}
                </li>
                <li role="button" @click="unblock(account)" v-if="blocking">
                  {{ $t('side_bar.account_profile.unblock') }}
                </li>
                <li role="button" @click="block(account)" v-else>
                  {{ $t('side_bar.account_profile.block') }}
                </li>
              </ul>

              <template #reference>
                <el-button link :title="$t('side_bar.account_profile.detail')">
                  <font-awesome-icon icon="gear" size="xl" />
                </el-button>
              </template>
            </el-popover>
          </div>
          <div class="icon" role="presentation">
            <FailoverImg :src="account?.avatar" :alt="`Avatar of ${account?.username}`" />
          </div>
          <div class="follow-status" v-if="relationship !== null && !isOwnProfile">
            <div v-if="relationship.following" class="unfollow" @click="unfollow(account)" :title="$t('side_bar.account_profile.unfollow')">
              <font-awesome-icon icon="user-xmark" size="xl" />
            </div>
            <div v-else-if="relationship.requested" :title="$t('side_bar.account_profile.follow_requested')">
              <font-awesome-icon icon="hourglass" size="xl" />
            </div>
            <div v-else class="follow" @click="follow(account)" :title="$t('side_bar.account_profile.follow')">
              <font-awesome-icon icon="user-plus" size="xl" />
            </div>
          </div>
        </div>
        <div class="username">
          <bdi v-html="username(account)"></bdi>
        </div>
        <div class="account">@{{ account?.acct }}</div>
        <div class="note" v-html="note(account)" @click.capture.prevent="noteClick"></div>
      </div>
    </div>
    <div class="identity">
      <dl v-for="(identity, index) in identityProofs" :key="index">
        <dt>
          {{ identity.provider }}
        </dt>
        <dd @click.capture.prevent="identityOpen(identity.profile_url)">
          {{ identity.provider_username }}
        </dd>
      </dl>
    </div>
    <div class="metadata">
      <dl v-for="(data, index) in account?.fields" :key="index">
        <dt>
          {{ data.name }}
        </dt>
        <dd v-html="data.value" @click.capture.prevent="metadataClick"></dd>
      </dl>
    </div>
    <el-row class="basic-info">
      <el-col :span="8" :class="activeTab === 1 ? 'info info-active' : 'info'">
        <el-button link class="tab" @click="changeTab(1)">
          <div class="title">{{ $t('side_bar.account_profile.toots') }}</div>
          <div class="count">{{ account?.statuses_count }}</div>
        </el-button>
      </el-col>
      <el-col :span="8" :class="activeTab === 2 ? 'info info-active' : 'info'">
        <el-button link class="tab" @click="changeTab(2)">
          <div class="title">{{ $t('side_bar.account_profile.follows') }}</div>
          <div class="count">{{ account?.following_count }}</div>
        </el-button>
      </el-col>
      <el-col :span="8" :class="activeTab === 3 ? 'info info-active' : 'info'">
        <el-button link class="tab" @click="changeTab(3)">
          <div class="title">
            {{ $t('side_bar.account_profile.followers') }}
          </div>
          <div class="count">{{ account?.followers_count }}</div>
        </el-button>
      </el-col>
    </el-row>
    <div class="timeline">
      <timeline :account="account" v-if="activeTab === 1"></timeline>
      <follows :account="account" v-if="activeTab === 2"></follows>
      <followers :account="account" v-if="activeTab === 3"></followers>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { findLink } from '@/utils/tootParser'
import emojify from '@/utils/emojify'
import Timeline from './AccountProfile/Timeline.vue'
import Follows from './AccountProfile/Follows.vue'
import Followers from './AccountProfile/Followers.vue'
import FailoverImg from '@/components/atoms/FailoverImg.vue'
import { useStore } from '@/store'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/SideBar/AccountProfile'
import { ACTION_TYPES as LIST_MEMBERSHIP_ACTION } from '@/store/TimelineSpace/Modals/ListMembership'
import { ACTION_TYPES as MUTE_ACTION } from '@/store/TimelineSpace/Modals/MuteConfirm'

export default defineComponent({
  name: 'account-profile',
  components: {
    Timeline,
    Follows,
    Followers,
    FailoverImg
  },
  setup(_, ctx) {
    const space = 'TimelineSpace/Contents/SideBar/AccountProfile'
    const store = useStore()
    const i18n = useI18next()

    const activeTab = ref<number>(1)

    const theme = computed(() => {
      return {
        '--theme-mask-color': store.state.App.theme.wrapper_mask_color,
        '--theme-border-color': store.state.App.theme.border_color,
        '--theme-primary-color': store.state.App.theme.primary_color
      }
    })
    const account = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.account)
    const identityProofs = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.identityProofs)
    const relationship = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.relationship)
    const loading = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.loading)
    const muting = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.relationship?.muting)
    const blocking = computed(() => store.state.TimelineSpace.Contents.SideBar.AccountProfile.relationship?.blocking)
    const isOwnProfile = computed(() => store.getters[`${space}/isOwnProfile`])

    watch(account, () => {
      activeTab.value = 1
    })
    watch(loading, (newVal, _oldVal) => {
      ctx.emit('change-loading', newVal)
    })

    const username = (account: Entity.Account) => {
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.username
      }
    }
    const note = (account: Entity.Account) => {
      return emojify(account.note, account.emojis)
    }
    const noteClick = (e: Event) => {
      const link = findLink(e.target as HTMLElement, 'note')
      if (link !== null) {
        ;(window as any).shell.openExternal(link)
      }
    }
    const follow = (account: Entity.Account) => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, true)
      try {
        store.dispatch(`${space}/${ACTION_TYPES.FOLLOW}`, account)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.follow_error'),
          type: 'error'
        })
      } finally {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, false)
      }
    }
    const unfollow = (account: Entity.Account) => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, true)
      try {
        store.dispatch(`${space}/${ACTION_TYPES.UNFOLLOW}`, account)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.unfollow_error'),
          type: 'error'
        })
      } finally {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, false)
      }
    }
    const changeTab = (payload: number) => {
      activeTab.value = payload
    }
    const openBrowser = (account: Entity.Account) => {
      ;(window as any).shell.openExternal(account.url)
    }
    const addToList = (account: Entity.Account) => {
      store.dispatch(`TimelineSpace/Modals/ListMembership/${LIST_MEMBERSHIP_ACTION.SET_ACCOUNT}`, account)
      store.dispatch(`TimelineSpace/Modals/ListMembership/${LIST_MEMBERSHIP_ACTION.CHANGE_MODAL}`, true)
    }
    const confirmMute = (account: Entity.Account) => {
      store.dispatch(`TimelineSpace/Modals/MuteConfirm/${MUTE_ACTION.CHANGE_ACCOUNT}`, account)
      store.dispatch(`TimelineSpace/Modals/MuteConfirm/${MUTE_ACTION.CHANGE_MODAL}`, true)
    }
    const unmute = (account: Entity.Account) => {
      store.dispatch(`${space}/${ACTION_TYPES.UNMUTE}`, account)
    }
    const block = (account: Entity.Account) => {
      store.dispatch(`${space}/${ACTION_TYPES.BLOCK}`, account)
    }
    const unblock = (account: Entity.Account) => {
      store.dispatch(`${space}/${ACTION_TYPES.UNBLOCK}`, account)
    }
    const metadataClick = (e: Event) => {
      const link = findLink(e.target as HTMLElement, 'metadata')
      if (link !== null) {
        return (window as any).shell.openExternal(link)
      }
    }
    const identityOpen = (link: string) => {
      return (window as any).shell.openExternal(link)
    }
    const subscribe = (account: Entity.Account) => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, true)
      try {
        store.dispatch(`${space}/${ACTION_TYPES.SUBSCRIBE}`, account)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.subscribe_error'),
          type: 'error'
        })
      } finally {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, false)
      }
    }
    const unsubscribe = (account: Entity.Account) => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, true)
      try {
        store.dispatch(`${space}/${ACTION_TYPES.UNSUBSCRIBE}`, account)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.unsubscribe_error'),
          type: 'error'
        })
      } finally {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_LOADING}`, false)
      }
    }

    return {
      activeTab,
      loading,
      account,
      relationship,
      isOwnProfile,
      muting,
      blocking,
      identityProofs,
      theme,
      username,
      note,
      noteClick,
      changeTab,
      unsubscribe,
      subscribe,
      openBrowser,
      addToList,
      unmute,
      confirmMute,
      unblock,
      block,
      unfollow,
      follow,
      metadataClick,
      identityOpen
    }
  }
})
</script>

<style lang="scss" scoped>
#account_profile {
  .header-background {
    background-position: 50% 50%;
    background-size: cover;
  }

  .header {
    background-color: var(--theme-wrapper-mask-color);
    text-align: center;
    padding: 12px;
    box-sizing: border-box;
    word-wrap: break-word;
    font-size: var(--base-font-size);

    .relationship {
      display: flex;
      justify-content: space-between;

      .follower-status {
        .status {
          color: #fff;
          background-color: rgba(0, 0, 0, 0.3);
          font-size: 1rem;
        }
      }

      .notify {
        cursor: pointer;

        .unsubscribe {
          color: #409eff;
        }
      }
    }

    .user-info {
      display: flex;
      justify-content: space-around;
      align-items: center;

      .follow-status {
        .follow {
          cursor: pointer;
        }

        .unfollow {
          color: #409eff;
          cursor: pointer;
        }
      }

      .icon {
        padding: 12px;

        img {
          width: 72px;
          border-radius: 8px;
        }
      }
    }

    .username {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: calc(var(--base-font-size) * 1.71);
      margin: 0 auto 12px auto;
    }

    .username :deep(.emojione) {
      max-width: 1em;
      max-height: 1em;
    }

    .account {
      color: #409eff;
    }

    .note :deep(.emojione) {
      max-width: 1.2em;
      height: 1.2em;
    }
  }

  .identity {
    dl {
      display: flex;
      border-top: 1px solid var(--theme-border-color);
      margin: 0;

      dt {
        background-color: var(--theme-selected-background-color);
        flex: 0 0 auto;
        width: 120px;
        text-align: center;
        padding: 16px 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      dd {
        background-color: rgba(121, 189, 154, 0.25);
        flex: 1 1 auto;
        padding: 16px 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        margin: 0;
        color: #79bd9a;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }

  .metadata {
    dl {
      display: flex;
      border-top: 1px solid var(--theme-border-color);
      margin: 0;

      dt {
        background-color: var(--theme-selected-background-color);
        flex: 0 0 auto;
        width: 120px;
        text-align: center;
        padding: 16px 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      dd {
        flex: 1 1 auto;
        padding: 16px 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        margin: 0;
      }
    }
  }

  .basic-info {
    .info {
      border-top: solid 1px var(--theme-border-color);
      border-bottom: solid 1px var(--theme-border-color);
      border-left: solid 1px var(--theme-border-color);
      padding: 0 4px;

      .tab {
        margin: 0;
        padding: 0;
        width: 100%;
        text-align: left;
        line-height: 20px;
        height: auto;
        display: block;
      }

      .tab :deep(span) {
        display: block;
      }

      .title {
        font-size: calc(var(--base-font-size) * 0.8);
        color: #909399;
      }

      .count {
        font-weight: 800;
        font-size: calc(var(--base-font-size) * 1.14);
        color: var(--theme-primary-color);
      }
    }

    .info-active {
      border-bottom: solid 1px #409eff;

      .count {
        color: #409eff;
      }
    }

    .info:first-of-type {
      border-left: none;
    }
  }

  .timeline {
    font-size: calc(var(--base-font-size) * 0.85);
  }
}
</style>

<style lang="scss">
.account-menu-popper {
  padding: 2px 0 !important;
  border-color: #909399;

  .menu-list {
    padding: 0;
    font-size: calc(var(--base-font-size) * 0.9);
    list-style-type: none;
    line-height: 32px;
    text-align: left;
    color: #303133;
    margin: 4px 0;

    li {
      box-sizing: border-box;
      padding: 0 32px 0 16px;

      &:hover {
        background-color: #409eff;
        color: #fff;
        cursor: pointer;
      }
    }
  }
}
</style>
