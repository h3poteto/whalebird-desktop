<template>
  <div id="side_menu">
    <div :class="collapse ? 'profile-wrapper narrow-menu' : 'profile-wrapper'" style="-webkit-app-region: drag">
      <div :class="collapse ? 'profile-narrow' : 'profile-wide'">
        <div class="account">
          <div class="avatar" v-if="collapse">
            <img :src="account.avatar" />
          </div>
          <div class="acct" v-else>
            @{{ account.username }}
            <span class="domain-name">{{ account.domain }}</span>
          </div>
          <el-dropdown trigger="click" @command="handleProfile" :title="$t('side_menu.profile')">
            <span class="el-dropdown-link">
              <font-awesome-icon icon="arrow-up" class="el-icon--right" />
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
        <el-button type="text" class="release-collapse" @click="releaseCollapse" v-if="collapse" :title="$t('side_menu.expand')">
          <font-awesome-icon :icon="['fa', 'angles-right']" />
        </el-button>
        <el-button type="text" class="do-collapse" @click="doCollapse" v-else :title="$t('side_menu.collapse')">
          <font-awesome-icon :icon="['fa', 'angles-left']" />
        </el-button>
      </div>
    </div>
    <el-menu
      :default-active="activeRoute()"
      :background-color="themeColor"
      text-color="#909399"
      :collapse="collapse"
      active-text-color="#ffffff"
      :router="true"
      :class="collapse ? 'el-menu-vertical timeline-menu narrow-menu' : 'el-menu-vertical timeline-menu'"
      role="menu"
    >
      <el-menu-item :index="`/${id()}/home`" role="menuitem" :title="$t('side_menu.home')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="home" />
        </div>
        <div>
          <span>{{ $t('side_menu.home') }}</span>
          <el-badge is-dot :hidden="!unreadHomeTimeline"> </el-badge>
        </div>
      </el-menu-item>
      <el-menu-item
        :index="`/${id()}/notifications`"
        role="menuitem"
        :title="$t('side_menu.notification')"
        class="menu-item"
        v-if="enabledTimelines.notification"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="bell" />
        </div>
        <div>
          <span>{{ $t('side_menu.notification') }}</span>
          <el-badge is-dot :hidden="!unreadNotifications"> </el-badge>
        </div>
      </el-menu-item>
      <el-menu-item
        :index="`/${id()}/mentions`"
        role="menuitem"
        :title="$t('side_menu.mention')"
        class="menu-item"
        v-if="enabledTimelines.mention"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="at" />
        </div>
        <div>
          <span>{{ $t('side_menu.mention') }}</span>
          <el-badge is-dot :hidden="!unreadMentions"> </el-badge>
        </div>
      </el-menu-item>
      <el-menu-item
        :index="`/${id()}/direct-messages`"
        role="menuitem"
        :title="$t('side_menu.direct')"
        class="menu-item"
        v-if="enabledTimelines.direct"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="envelope" />
        </div>
        <div>
          <span>{{ $t('side_menu.direct') }}</span>
          <el-badge is-dot :hidden="!unreadDirectMessagesTimeline"> </el-badge>
        </div>
      </el-menu-item>
      <el-menu-item
        v-if="unreadFollowRequests"
        :index="`/${id()}/follow-requests`"
        role="menuitem"
        :title="$t('side_menu.follow_requests')"
        class="menu-item"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="users" />
        </div>
        <div>
          <span>{{ $t('side_menu.follow_requests') }}</span>
          <el-badge is-dot></el-badge>
        </div>
      </el-menu-item>
      <el-menu-item
        :index="`/${id()}/favourites`"
        role="menuitem"
        :title="$t('side_menu.favourite')"
        class="menu-item"
        v-if="enabledTimelines.favourite"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="star" />
        </div>
        <div>
          <span>{{ $t('side_menu.favourite') }}</span>
        </div>
      </el-menu-item>
      <el-menu-item
        :index="`/${id()}/bookmarks`"
        role="menuitem"
        :title="$t('side_menu.bookmark')"
        class="menu-item"
        v-if="enabledTimelines.bookmark"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="bookmark" />
        </div>
        <div>
          <span>{{ $t('side_menu.bookmark') }}</span>
        </div>
      </el-menu-item>
      <el-menu-item
        :index="`/${id()}/local`"
        role="menuitem"
        :title="$t('side_menu.local')"
        class="menu-item"
        v-if="enabledTimelines.local"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="users" />
        </div>
        <div>
          <span>{{ $t('side_menu.local') }}</span>
          <el-badge is-dot :hidden="!unreadLocalTimeline"> </el-badge>
        </div>
      </el-menu-item>
      <el-menu-item
        :index="`/${id()}/public`"
        role="menuitem"
        :title="$t('side_menu.public')"
        class="menu-item"
        v-if="enabledTimelines.public"
      >
        <div class="menu-item-icon">
          <font-awesome-icon icon="globe" />
        </div>
        <div>
          <span>{{ $t('side_menu.public') }}</span>
          <el-badge is-dot :hidden="!unreadPublicTimeline"> </el-badge>
        </div>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/search`" role="menuitem" :title="$t('side_menu.search')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="magnifying-glass" />
        </div>
        <div>
          <span>{{ $t('side_menu.search') }}</span>
        </div>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/hashtag`" role="menuitem" :title="$t('side_menu.hashtag')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="hashtag" />
        </div>
        <div>
          <span>{{ $t('side_menu.hashtag') }}</span>
        </div>
      </el-menu-item>
      <template v-if="enabledTimelines.tag">
        <template v-for="tag in tags" :key="tag.tagName">
          <el-menu-item
            :index="`/${id()}/hashtag/${tag.tagName}`"
            :class="collapse ? '' : 'sub-menu'"
            role="menuitem"
            :title="tag.tagName"
            class="menu-item"
          >
            <div class="menu-item-icon">
              <font-awesome-icon icon="hashtag" size="sm" />
            </div>
            <div>
              <span>{{ tag.tagName }}</span>
            </div>
          </el-menu-item>
        </template>
      </template>
      <el-menu-item :index="`/${id()}/lists`" role="menuitem" :title="$t('side_menu.lists')" class="menu-item">
        <div class="menu-item-icon">
          <font-awesome-icon icon="list-ul" />
        </div>
        <div>
          <span>{{ $t('side_menu.lists') }}</span>
        </div>
      </el-menu-item>
      <template v-if="enabledTimelines.list">
        <template v-for="list in lists" :key="list.id">
          <el-menu-item
            :index="`/${id()}/lists/${list.id}`"
            :class="collapse ? '' : 'sub-menu'"
            role="menuitem"
            :title="list.title"
            class="menu-item"
          >
            <div class="menu-item-icon">
              <font-awesome-icon icon="list-ul" size="sm" />
            </div>
            <div>
              <span>{{ list.title }}</span>
            </div>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
    <el-button v-if="hideGlobalHeader" class="global-header-control" type="text" @click="changeGlobalHeader(false)">
      <font-awesome-icon icon="angles-right" />
    </el-button>
    <el-button v-else class="global-header-control" type="text" @click="changeGlobalHeader(true)">
      <font-awesome-icon icon="angles-left" />
    </el-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'side-menu',
  computed: {
    ...mapState('TimelineSpace/SideMenu', {
      unreadHomeTimeline: state => state.unreadHomeTimeline,
      unreadNotifications: state => state.unreadNotifications,
      unreadMentions: state => state.unreadMentions,
      unreadLocalTimeline: state => state.unreadLocalTimeline,
      unreadDirectMessagesTimeline: state => state.unreadDirectMessagesTimeline,
      unreadPublicTimeline: state => state.unreadPublicTimeline,
      unreadFollowRequests: state => state.unreadFollowRequests,
      lists: state => state.lists,
      tags: state => state.tags,
      collapse: state => state.collapse,
      enabledTimelines: state => state.enabledTimelines
    }),
    ...mapState({
      account: state => state.TimelineSpace.account,
      themeColor: state => state.App.theme.side_menu_color,
      hideGlobalHeader: state => state.GlobalHeader.hide
    })
  },
  created() {
    this.$store.dispatch('TimelineSpace/SideMenu/readCollapse')
    this.$store.dispatch('TimelineSpace/SideMenu/listTags')
  },
  methods: {
    activeRoute() {
      return this.$route.path
    },
    id() {
      return this.$route.params.id
    },
    handleProfile(command) {
      switch (command) {
        case 'show':
          this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/fetchAccount', this.account.accountId).then(account => {
            this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
            this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
          })

          this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
          break
        case 'edit':
          window.shell.openExternal(this.account.baseURL + '/settings/profile')
          break
        case 'settings': {
          const url = `/${this.id()}/settings`
          this.$router.push(url)
          break
        }
      }
    },
    doCollapse() {
      this.$store.dispatch('TimelineSpace/SideMenu/changeCollapse', true)
    },
    releaseCollapse() {
      this.$store.dispatch('TimelineSpace/SideMenu/changeCollapse', false)
    },
    async changeGlobalHeader(value) {
      await this.$store.dispatch('GlobalHeader/switchHide', value)
    }
  }
}
</script>

<style lang="scss" scoped>
#side_menu {
  .profile-wrapper {
    background-color: var(--theme-side-menu-color);
    position: fixed;
    top: 0;
    width: 180px;
    height: 82px;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: flex-start;
    justify-content: flex-end;

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

  .timeline-menu /deep/ {
    position: fixed;
    top: 82px;
    height: calc(100% - 82px);
    width: 180px;
    border: none;
    overflow: hidden;

    .el-badge__content {
      background-color: #409eff;
      border: none;
      margin-left: 4px;
    }

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

      .menu-item-icon {
        text-align: center;
        padding-right: 2px;
        width: 18px;
      }
    }
  }

  .timeline-menu:hover /deep/ {
    overflow-y: auto;
  }

  .narrow-menu /deep/ {
    width: 64px;

    .el-menu-item {
      margin-left: 4px;
    }

    .el-badge {
      vertical-align: top;
      line-height: 32px;
      margin-left: -8px;
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
