<template>
  <el-aside id="side_menu" width="180">
    <div :class="collapse ? 'profile-wrapper narrow-menu' : 'profile-wrapper'" style="-webkit-app-region: drag">
      <div :class="collapse ? 'profile-narrow' : 'profile-wide'">
        <div class="account">
          <div class="avatar" v-if="collapse">
            <img :src="account.account?.avatar" />
          </div>
          <div class="acct" v-else>
            @{{ account.account?.username }}
            <span class="domain-name">{{ account.server?.domain }}</span>
          </div>
          <el-dropdown trigger="click" @command="handleProfile" :title="$t('side_menu.profile')">
            <span class="el-dropdown-link">
              <font-awesome-icon icon="angle-down" class="el-icon--right" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="show">{{ $t('side_menu.show_profile') }}</el-dropdown-item>
                <el-dropdown-item command="edit">{{ $t('side_menu.edit_profile') }}</el-dropdown-item>
                <el-dropdown-item command="settings">{{ $t('side_menu.settings') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="collapse">
        <el-button v-if="collapse" link class="release-collapse" :title="$t('side_menu.expand')" @click="releaseCollapse">
          <font-awesome-icon :icon="['fa', 'angles-right']" />
        </el-button>
        <el-button v-else link class="do-collapse" :title="$t('side_menu.collapse')" @click="doCollapse">
          <font-awesome-icon :icon="['fa', 'angles-left']" />
        </el-button>
      </div>
    </div>
    <el-menu
      :default-active="activeRoute"
      :background-color="themeColor"
      text-color="#909399"
      :collapse="collapse"
      active-text-color="#ffffff"
      :router="true"
      :class="collapse ? 'el-menu-vertical timeline-menu narrow-menu' : 'el-menu-vertical timeline-menu'"
      role="menu"
    >
      <el-menu-item :index="`/${id}/home`" role="menuitem" :title="$t('side_menu.home')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="home" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.home') }}</span>
            <el-badge is-dot :hidden="!unreadHomeTimeline"> </el-badge>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item
        :index="`/${id}/notifications`"
        role="menuitem"
        :title="$t('side_menu.notification')"
        class="menu-item"
        v-if="enabledTimelines.notification"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="bell" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.notification') }}</span>
            <el-badge is-dot :hidden="!unreadNotifications"> </el-badge>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item
        :index="`/${id}/direct-messages`"
        role="menuitem"
        :title="$t('side_menu.direct')"
        class="menu-item"
        v-if="enabledTimelines.direct"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="envelope" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.direct') }}</span>
            <el-badge is-dot :hidden="!unreadDirectMessagesTimeline"> </el-badge>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item
        v-if="followRequests.length > 0"
        :index="`/${id}/follow-requests`"
        role="menuitem"
        :title="$t('side_menu.follow_requests')"
        class="menu-item"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="users" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.follow_requests') }}</span>
            <el-badge is-dot></el-badge>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item
        :index="`/${id}/favourites`"
        role="menuitem"
        :title="$t('side_menu.favourite')"
        class="menu-item"
        v-if="enabledTimelines.favourite"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="star" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.favourite') }}</span>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item
        :index="`/${id}/bookmarks`"
        role="menuitem"
        :title="$t('side_menu.bookmark')"
        class="menu-item"
        v-if="enabledTimelines.bookmark"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="bookmark" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.bookmark') }}</span>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item :index="`/${id}/local`" role="menuitem" :title="$t('side_menu.local')" class="menu-item" v-if="enabledTimelines.local">
        <div class="menu-item-icon">
          <font-awesome-icon icon="users" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.local') }}</span>
            <el-badge is-dot :hidden="!unreadLocalTimeline"> </el-badge>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item
        :index="`/${id}/public`"
        role="menuitem"
        :title="$t('side_menu.public')"
        class="menu-item"
        v-if="enabledTimelines.public"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="globe" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.public') }}</span>
            <el-badge is-dot :hidden="!unreadPublicTimeline"> </el-badge>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item :index="`/${id}/search`" role="menuitem" :title="$t('side_menu.search')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="magnifying-glass" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.search') }}</span>
          </div>
        </template>
      </el-menu-item>
      <el-menu-item :index="`/${id}/hashtag`" role="menuitem" :title="$t('side_menu.hashtag')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="hashtag" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.hashtag') }}</span>
          </div>
        </template>
      </el-menu-item>
      <template v-if="enabledTimelines.tag">
        <template v-for="tag in tags" :key="tag.tagName">
          <el-menu-item
            :index="`/${id}/hashtag/${tag.tagName}`"
            :class="collapse ? '' : 'sub-menu'"
            role="menuitem"
            :title="tag.tagName"
            class="menu-item"
          >
            <div class="menu-item-icon">
              <font-awesome-icon icon="hashtag" size="sm" />
            </div>
            <template #title>
              <div>
                <span>{{ tag.tagName }}</span>
              </div>
            </template>
          </el-menu-item>
        </template>
      </template>
      <el-menu-item :index="`/${id}/lists`" role="menuitem" :title="$t('side_menu.lists')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="list-ul" />
        </div>
        <template #title>
          <div>
            <span>{{ $t('side_menu.lists') }}</span>
          </div>
        </template>
      </el-menu-item>
      <template v-if="enabledTimelines.list">
        <template v-for="list in lists" :key="list.id">
          <el-menu-item
            :index="`/${id}/lists/${list.id}`"
            :class="collapse ? '' : 'sub-menu'"
            role="menuitem"
            :title="list.title"
            class="menu-item"
          >
            <div class="menu-item-icon">
              <font-awesome-icon icon="list-ul" size="sm" />
            </div>
            <template #title>
              <div>
                <span>{{ list.title }}</span>
              </div>
            </template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
    <el-button v-if="hideGlobalHeader" class="global-header-control" link @click="changeGlobalHeader(false)">
      <font-awesome-icon icon="angles-right" />
    </el-button>
    <el-button v-else class="global-header-control" link @click="changeGlobalHeader(true)">
      <font-awesome-icon icon="angles-left" />
    </el-button>
  </el-aside>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/SideMenu'
import { ACTION_TYPES as GLOBAL_ACTION } from '@/store/GlobalHeader'
import { MyWindow } from '~/src/types/global'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { LocalTag } from '~/src/types/localTag'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'side-menu',
  setup() {
    const space = 'TimelineSpace/SideMenu'
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const { t } = useTranslation()

    const win = (window as any) as MyWindow

    const lists = ref<Array<Entity.List>>([])
    const tags = ref<Array<LocalTag>>([])
    const followRequests = ref<Array<Entity.FollowRequest | Entity.Account>>([])
    const enabledTimelines = reactive({
      home: true,
      notification: true,
      direct: true,
      favourite: true,
      bookmark: true,
      local: true,
      public: true,
      tag: true,
      list: true
    })
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const unreadHomeTimeline = computed(() => store.state.TimelineSpace.SideMenu.unreadHomeTimeline)
    const unreadNotifications = computed(() => store.state.TimelineSpace.SideMenu.unreadNotifications)
    const unreadLocalTimeline = computed(() => store.state.TimelineSpace.SideMenu.unreadLocalTimeline)
    const unreadDirectMessagesTimeline = computed(() => store.state.TimelineSpace.SideMenu.unreadDirectMessagesTimeline)
    const unreadPublicTimeline = computed(() => store.state.TimelineSpace.SideMenu.unreadPublicTimeline)
    const collapse = computed(() => store.state.TimelineSpace.SideMenu.collapse)
    const themeColor = computed(() => store.state.App.theme.side_menu_color)
    const hideGlobalHeader = computed(() => store.state.GlobalHeader.hide)
    const userAgent = computed(() => store.state.App.userAgent)
    const activeRoute = computed(() => route.path)
    const id = computed(() => parseInt(route.params.id as string))

    onMounted(async () => {
      store.dispatch(`${space}/${ACTION_TYPES.READ_COLLAPSE}`)
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      const client = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      await fetchFollowRequests(client)
      await fetchLists(client)
      await fetchTags(a)
      await confirmTimelines(client)
    })

    const fetchFollowRequests = async (client: MegalodonInterface) => {
      const res = await client.getFollowRequests()
      followRequests.value = res.data
    }

    const fetchLists = async (client: MegalodonInterface) => {
      const res = await client.getLists()
      lists.value = res.data
    }

    const fetchTags = async (account: LocalAccount) => {
      tags.value = await win.ipcRenderer.invoke('list-hashtags', account.id)
    }

    const confirmTimelines = async (client: MegalodonInterface) => {
      const notification = async () => {
        return client.getNotifications({ limit: 1 }).catch(() => {
          enabledTimelines.notification = false
        })
      }
      const direct = async () => {
        return client.getConversationTimeline({ limit: 1 }).catch(() => {
          enabledTimelines.direct = false
        })
      }
      const favourite = async () => {
        return client.getFavourites({ limit: 1 }).catch(() => {
          enabledTimelines.favourite = false
        })
      }
      const bookmark = async () => {
        return client.getBookmarks({ limit: 1 }).catch(() => {
          enabledTimelines.bookmark = false
        })
      }
      const local = async () => {
        return client.getLocalTimeline({ limit: 1 }).catch(() => {
          enabledTimelines.local = false
        })
      }
      const pub = async () => {
        return client.getPublicTimeline({ limit: 1 }).catch(() => {
          enabledTimelines.public = false
        })
      }
      await Promise.all([notification(), direct(), favourite(), bookmark(), local(), pub()])
    }

    const handleProfile = (command: string) => {
      switch (command) {
        case 'show':
          if (!account.account) {
            return
          }
          router.push({ query: { detail: 'true', account_id: account.account.accountId } })
          break
        case 'edit':
          if (account.server) {
            win.ipcRenderer.invoke('open-browser', account.server.baseURL + '/settings/profile')
          }
          break
        case 'settings': {
          const url = `/${id.value}/settings`
          router.push(url)
          break
        }
      }
    }
    const doCollapse = () => {
      store.dispatch(`${space}/${ACTION_TYPES.CHANGE_COLLAPSE}`, true)
    }
    const releaseCollapse = () => {
      store.dispatch(`${space}/${ACTION_TYPES.CHANGE_COLLAPSE}`, false)
    }
    const changeGlobalHeader = async value => {
      await store.dispatch(`GlobalHeader/${GLOBAL_ACTION.SWITCH_HIDE}`, value)
    }

    return {
      unreadHomeTimeline,
      unreadNotifications,
      unreadLocalTimeline,
      unreadDirectMessagesTimeline,
      unreadPublicTimeline,
      followRequests,
      lists,
      tags,
      collapse,
      enabledTimelines,
      account,
      themeColor,
      hideGlobalHeader,
      activeRoute,
      id,
      handleProfile,
      doCollapse,
      releaseCollapse,
      changeGlobalHeader,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#side_menu {
  .profile-wrapper {
    background-color: var(--theme-side-menu-color);
    width: 200px;
    height: 82px;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: flex-start;
    justify-content: space-between;

    .account {
      display: flex;
      align-items: center;
      justify-content: center;

      .acct {
        max-width: 117px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .el-dropdown-link {
        cursor: pointer;
        color: #dcdfe6;

        &:hover {
          color: #409eff;
        }
      }
    }

    .profile-wide {
      color: #fff;
      font-weight: bold;
      padding: 20px 8px 18px 20px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;

      .domain-name {
        word-break: break-all;
        white-space: nowrap;
      }
    }

    .profile-narrow {
      padding-top: 20px;
      padding-bottom: 2px;

      .avatar {
        display: inline;

        img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
        }
      }

      .account {
        flex-direction: column;
      }
    }

    .collapse {
      display: flex;

      .do-collapse {
        color: #dcdfe6;
        padding: 0;
        margin-top: 8px;

        &:hover {
          color: #409eff;
        }
      }

      .release-collapse {
        color: #dcdfe6;
        padding: 0;
        margin-top: 8px;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .timeline-menu :deep(.el-badge__content) {
    background-color: #409eff;
    border: none;
    margin-left: 8px;
  }

  .timeline-menu {
    height: calc(100% - 82px);
    width: 200px;
    border: none;
    overflow-x: hidden;

    .menu-item-title {
      color: rgb(144, 147, 153);
      cursor: default;
    }

    .menu-item-title:hover {
      background-color: inherit;
    }

    .sub-menu {
      padding-left: 45px !important;
      height: 32px;
      line-height: 32px;
      font-size: 14px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      height: 44px;

      .menu-item-icon {
        text-align: center;
        padding-right: 6px;
        width: 18px;

        svg {
          width: var(--fa-fw-width, 1.25em);
        }
      }
    }

    .menu-item * {
      vertical-align: middle;
    }

    .el-badge {
      vertical-align: top;
      line-height: 32px;
      margin-left: 0;
    }
  }

  .narrow-menu {
    width: 64px;
    justify-content: flex-end;

    .el-menu-item {
      margin-left: 4px;
    }
  }

  .global-header-control {
    position: fixed;
    bottom: 0;
    color: #dcdfe6;
    margin: 0;
    padding: 4px 0 0 0;
    border-radius: 0 4px 4px 0;
    background-color: var(--theme-global-header-color);
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
  }
}
</style>
