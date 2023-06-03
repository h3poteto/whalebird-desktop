<template>
  <div id="account_profile" role="article" aria-label="account profile" v-if="user">
    <div class="header-background" :style="{ backgroundImage: 'url(' + user.header + ')' }">
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
              @click="unsubscribe(user)"
              :title="$t('side_bar.account_profile.unsubscribe')"
            >
              <font-awesome-icon icon="bell" size="lg" />
            </div>
            <div v-else class="subscribe" @click="subscribe(user)" :title="$t('side_bar.account_profile.subscribe')">
              <font-awesome-icon :icon="['far', 'bell']" size="lg" />
            </div>
          </div>
        </div>

        <div class="user-info">
          <div class="more" v-if="relationship !== null && !isOwnProfile">
            <el-popover placement="bottom" width="200" trigger="click" popper-class="account-menu-popper">
              <ul class="menu-list">
                <li role="button" @click="openBrowser(user!.url)">
                  {{ $t('side_bar.account_profile.open_in_browser') }}
                </li>
                <li role="button" @click="addToList(user)">
                  {{ $t('side_bar.account_profile.manage_list_memberships') }}
                </li>
                <li role="button" @click="unmute(user)" v-if="relationship.muting">
                  {{ $t('side_bar.account_profile.unmute') }}
                </li>
                <li role="button" @click="confirmMute(user)" v-else>
                  {{ $t('side_bar.account_profile.mute') }}
                </li>
                <li role="button" @click="unblock(user)" v-if="relationship.blocking">
                  {{ $t('side_bar.account_profile.unblock') }}
                </li>
                <li role="button" @click="block(user)" v-else>
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
            <FailoverImg :src="user.avatar" :alt="`Avatar of ${user.username}`" />
          </div>
          <div class="follow-status" v-if="relationship !== null && !isOwnProfile">
            <div v-if="relationship.following" class="unfollow" @click="unfollow(user)" :title="$t('side_bar.account_profile.unfollow')">
              <font-awesome-icon icon="user-xmark" size="xl" />
            </div>
            <div v-else-if="relationship.requested" :title="$t('side_bar.account_profile.follow_requested')">
              <font-awesome-icon icon="hourglass" size="xl" />
            </div>
            <div v-else class="follow" @click="follow(user)" :title="$t('side_bar.account_profile.follow')">
              <font-awesome-icon icon="user-plus" size="xl" />
            </div>
          </div>
        </div>
        <div class="username">
          <bdi v-html="username(user)"></bdi>
        </div>
        <div class="account">@{{ user.acct }}</div>
        <div class="note" v-html="note(user)" @click.capture.prevent="noteClick"></div>
      </div>
    </div>
    <div class="identity">
      <dl v-for="(identity, index) in identityProofs" :key="index">
        <dt>
          {{ identity.provider }}
        </dt>
        <dd @click.capture.prevent="openBrowser(identity.profile_url)">
          {{ identity.provider_username }}
        </dd>
      </dl>
    </div>
    <div class="metadata">
      <dl v-for="(data, index) in user.fields" :key="index">
        <dt>
          {{ data.name }}
        </dt>
        <dd v-html="data.value" @click.capture.prevent="metadataClick"></dd>
      </dl>
    </div>
    <el-tabs class="timeline" v-model="activeTab" stretch v-if="account.account && account.server">
      <el-tab-pane :label="precision(user.statuses_count) + ' Posts'" name="posts"
        ><Posts :user="user" :account="account.account" :server="account.server"
      /></el-tab-pane>
      <el-tab-pane :label="precision(user.following_count) + ' Following'" name="following"
        ><Following :user="user" :account="account.account" :server="account.server"
      /></el-tab-pane>
      <el-tab-pane :label="precision(user.followers_count) + ' Followers'" name="followers"
        ><Followers :user="user" :account="account.account" :server="account.server"
      /></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { useStore } from '@/store'
import emojify from '@/utils/emojify'
import { findLink } from '@/utils/tootParser'
import { MyWindow } from '~/src/types/global'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { ACTION_TYPES as LIST_MEMBERSHIP_ACTION } from '@/store/TimelineSpace/Modals/ListMembership'
import { ACTION_TYPES as MUTE_ACTION } from '@/store/TimelineSpace/Modals/MuteConfirm'
import FailoverImg from '@/components/atoms/FailoverImg.vue'
import Posts from './Profile/Posts.vue'
import Following from './Profile/Following.vue'
import Followers from './Profile/Followers.vue'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'Profile',
  components: {
    FailoverImg,
    Posts,
    Following,
    Followers
  },
  setup() {
    const win = (window as any) as MyWindow
    const store = useStore()
    const route = useRoute()
    const { t } = useTranslation()

    const theme = computed(() => {
      return {
        '--theme-mask-color': store.state.App.theme.wrapper_mask_color,
        '--theme-border-color': store.state.App.theme.border_color,
        '--theme-primary-color': store.state.App.theme.primary_color
      }
    })
    const client = ref<MegalodonInterface | null>(null)
    const id = computed(() => parseInt(route.params.id as string))
    const userId = computed(() => route.query.account_id?.toString())
    const userAgent = computed(() => store.state.App.userAgent)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const user = ref<Entity.Account | null>(null)
    const relationship = ref<Entity.Relationship | null>(null)
    const isOwnProfile = computed(() => {
      if (!account.account || !account.server || !user.value) return false
      // For Mastodon
      if (`${account.server?.baseURL}/@${account.account?.username}` === user.value.url) return true
      // For Pleroma
      if (`${account.server.baseURL}/users/${account.account.username}` === user.value.url) return true
      return false
    })
    const identityProofs = ref<Array<Entity.IdentityProof>>([])
    const activeTab = ref<'posts' | 'following' | 'followers'>('posts')

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s
      const c = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      client.value = c

      if (userId.value) {
        await load(userId.value)
      }
    })

    watch(userId, async current => {
      if (current) {
        await load(current)
      }
    })

    const load = async (id: string) => {
      if (client.value) {
        const res = await client.value.getAccount(id)
        user.value = res.data
        const rel = await client.value.getRelationship(id)
        relationship.value = rel.data
        const proofs = await client.value.getIdentityProof(id)
        identityProofs.value = proofs.data
      }
    }

    const unsubscribe = async (a: Entity.Account | null) => {
      if (client.value && a) {
        const res = await client.value.unsubscribeAccount(a.id)
        relationship.value = res.data
      }
    }

    const subscribe = async (a: Entity.Account | null) => {
      if (client.value && a) {
        const res = await client.value.subscribeAccount(a.id)
        relationship.value = res.data
      }
    }

    const openBrowser = (text: string) => {
      win.ipcRenderer.invoke('open-browser', text)
    }

    const addToList = (a: Entity.Account | null) => {
      if (a) {
        store.dispatch(`TimelineSpace/Modals/ListMembership/${LIST_MEMBERSHIP_ACTION.SET_ACCOUNT}`, a)
        store.dispatch(`TimelineSpace/Modals/ListMembership/${LIST_MEMBERSHIP_ACTION.CHANGE_MODAL}`, true)
      }
    }

    const unmute = async (a: Entity.Account | null) => {
      if (client.value && a) {
        const res = await client.value.unmuteAccount(a.id)
        relationship.value = res.data
      }
    }

    const confirmMute = (a: Entity.Account | null) => {
      if (a) {
        store.dispatch(`TimelineSpace/Modals/MuteConfirm/${MUTE_ACTION.CHANGE_ACCOUNT}`, a)
        store.dispatch(`TimelineSpace/Modals/MuteConfirm/${MUTE_ACTION.CHANGE_MODAL}`, true)
      }
    }

    const unblock = async (a: Entity.Account | null) => {
      if (client.value && a) {
        const res = await client.value.unblockAccount(a.id)
        relationship.value = res.data
      }
    }

    const block = async (a: Entity.Account | null) => {
      if (client.value && a) {
        const res = await client.value.blockAccount(a.id)
        relationship.value = res.data
      }
    }

    const unfollow = async (a: Entity.Account | null) => {
      if (client.value && a) {
        const res = await client.value.unfollowAccount(a.id)
        relationship.value = res.data
      }
    }

    const follow = async (a: Entity.Account | null) => {
      if (client.value && a) {
        const res = await client.value.followAccount(a.id)
        relationship.value = res.data
      }
    }

    const username = (a: Entity.Account | null) => {
      if (!a) return ''
      if (a.display_name !== '') {
        return emojify(a.display_name, a.emojis)
      } else {
        return a.username
      }
    }

    const note = (a: Entity.Account | null) => {
      if (!a) return ''
      return emojify(a.note, a.emojis)
    }

    const noteClick = (e: Event) => {
      const link = findLink(e.target as HTMLElement, 'note')
      if (link !== null) {
        win.ipcRenderer.invoke('open-browser', link)
      }
    }

    const metadataClick = (e: Event) => {
      const link = findLink(e.target as HTMLElement, 'metadata')
      if (link !== null) {
        win.ipcRenderer.invoke('open-browser', link)
      }
    }

    const precision = (num: number) => {
      if (num > 1000) {
        return `${(num / 1000).toPrecision(3)}K`
      } else if (num > 1000000) {
        return `${(num / 1000000).toPrecision(3)}M`
      } else {
        return num.toString()
      }
    }

    return {
      user,
      relationship,
      theme,
      isOwnProfile,
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
      username,
      note,
      noteClick,
      identityProofs,
      metadataClick,
      precision,
      activeTab,
      account,
      $t: t
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

  .timeline :deep(.el-tabs__item) {
    --el-text-color-primary: var(--theme-secondary-color);
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
