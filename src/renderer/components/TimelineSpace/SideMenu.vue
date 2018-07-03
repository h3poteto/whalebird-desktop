<template>
  <div id="side_menu">
    <div :class="collapse ? 'profile-wrapper narrow-menu':'profile-wrapper'" style="-webkit-app-region: drag;">
      <div class="profile-narrow" v-if="collapse">
        <img :src="account.avatar" class="avatar" />
      </div>
      <div class="profile-wide" v-else>
        <div>@{{ account.username }}
          <el-dropdown trigger="click" @command="handleProfile">
            <span class="el-dropdown-link">
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="edit">Edit profile</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <span>{{ account.domain }}</span>
      </div>
      <div class="collapse">
        <el-button type="text" class="release-collapse" @click="releaseCollapse" v-if="collapse">
          <i class="el-icon-arrow-right"></i>
        </el-button>
        <el-button type="text" class="do-collapse" @click="doCollapse" v-else>
          <i class="el-icon-arrow-left"></i>
        </el-button>
      </div>
      <div class="clearfix"></div>
    </div>
    <el-menu
      :default-active="activeRoute()"
      :background-color="themeColor"
      text-color="#909399"
      :collapse="collapse"
      active-text-color="#ffffff"
      :router="true"
      :class="collapse ? 'el-menu-vertical timeline-menu narrow-menu':'el-menu-vertical timeline-menu'">
      <el-menu-item :index="`/${id()}/home`">
        <icon name="home"></icon>
        <span>Home</span>
        <el-badge is-dot :hidden="!unreadHomeTimeline">
        </el-badge>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/notifications`">
        <icon name="bell"></icon>
        <span>Notification</span>
        <el-badge is-dot :hidden="!unreadNotifications">
        </el-badge>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/favourites`">
        <icon name="star"></icon>
        <span>Favourite</span>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/local`">
        <icon name="users"></icon>
        <span>Local timeline</span>
        <el-badge is-dot :hidden="!unreadLocalTimeline">
        </el-badge>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/public`">
        <icon name="globe"></icon>
        <span>Public timeline</span>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/hashtag`">
        <icon name="hashtag"></icon>
        <span>Hashtag</span>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/search`">
        <icon name="search"></icon>
        <span>Search</span>
      </el-menu-item>
      <el-menu-item :index="`/${id()}/lists`">
        <icon name="list-ul"></icon>
        <span>Lists</span>
      </el-menu-item>
      <template v-for="list in lists">
        <el-menu-item :index="`/${id()}/lists/${list.id}`" class="sub-menu" v-bind:key="list.id">
          <span>#{{ list.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { shell } from 'electron'

export default {
  name: 'side-menu',
  computed: {
    ...mapState({
      account: state => state.TimelineSpace.account,
      unreadHomeTimeline: state => state.TimelineSpace.SideMenu.unreadHomeTimeline,
      unreadNotifications: state => state.TimelineSpace.SideMenu.unreadNotifications,
      unreadLocalTimeline: state => state.TimelineSpace.SideMenu.unreadLocalTimeline,
      lists: state => state.TimelineSpace.SideMenu.lists,
      themeColor: state => state.App.theme.side_menu_color,
      overrideActivePath: state => state.TimelineSpace.SideMenu.overrideActivePath,
      collapse: state => state.TimelineSpace.SideMenu.collapse
    })
  },
  created () {
    this.$store.dispatch('TimelineSpace/SideMenu/readCollapse')
  },
  methods: {
    activeRoute () {
      if (this.overrideActivePath === null) {
        return this.$route.path
      } else {
        return this.overrideActivePath
      }
    },
    id () {
      return this.$route.params.id
    },
    handleProfile (command) {
      switch (command) {
        case 'edit':
          shell.openExternal(this.account.baseURL + '/settings/profile')
          break
      }
    },
    doCollapse () {
      this.$store.dispatch('TimelineSpace/SideMenu/changeCollapse', true)
    },
    releaseCollapse () {
      this.$store.dispatch('TimelineSpace/SideMenu/changeCollapse', false)
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
    left: 65px;
    width: 180px;
    height: 70px;
    font-size: 16px;

    .profile-wide {
      float: left;
      color: #ffffff;
      font-weight: bold;
      padding: 20px 8px 10px 20px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;

      .el-dropdown-link {
        cursor: pointer;
      }
    }

    .profile-narrow {
      float: left;

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin: 18px 12px;
      }
    }

    .collapse {
      float: right;
      margin-top: 24px;

      .do-collapse {
        color: #606266;
        padding: 0;
      }

      .release-collapse {
        color: #606266;
        padding: 0;
      }
    }
  }

  .timeline-menu /deep/ {
    position: fixed;
    top: 70px;
    left: 65px;
    height: calc(100% - 70px);
    width: 180px;
    border: none;
    overflow-y: auto;

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
  }

  .narrow-menu {
    width: 76px;
  }
}
</style>
