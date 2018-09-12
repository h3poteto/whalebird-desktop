<template>
<div id="account_profile"
     v-loading="loading"
     :element-loading-text="$t('message.loading')"
     element-loading-spinner="el-icon-loading"
     element-loading-background="rgba(0, 0, 0, 0.8)">
  <div class="header-background" v-bind:style="{ backgroundImage: 'url(' + account.header + ')' }">
    <div class="header">
      <div class="follow-follower" v-if="relationship !== null && relationship !== '' && account.username!==user.username">
        <div class="follower-status">
          <span class="status" v-if="relationship.followed_by">{{ $t('side_bar.account_profile.follows_you') }}</span>
          <span class="status" v-else>{{ $t('side_bar.account_profile.doesnt_follow_you') }}</span>
        </div>
      </div>
      <div class="user-info">
        <div class="more" v-if="relationship !== null && relationship !== '' && account.username!==user.username">
          <popper trigger="click" :options="{placement: 'bottom'}" ref="popper">
            <div class="popper">
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
            </div>

            <el-button slot="reference" type="text" :title="$t('side_bar.account_profile.detail')">
              <icon name="cog" scale="1.4"></icon>
            </el-button>
          </popper>
        </div>
        <div class="icon">
          <img :src="account.avatar" />
        </div>
        <div class="follow-status" v-if="relationship !== null && relationship !== '' && account.username!==user.username">
          <div v-if="relationship.following" class="unfollow" @click="unfollow(account)" :title="$t('side_bar.account_profile.unfollow')">
            <icon name="user-times" scale="1.5"></icon>
          </div>
          <div v-else-if="relationship.requested" :title="$t('side_bar.account_profile.follow_requested')">
            <icon name="hourglass" scale="1.5"></icon>
          </div>
          <div v-else class="follow" @click="follow(account)" :title="$t('side_bar.account_profile.follow')">
            <icon name="user-plus" scale="1.5"></icon>
          </div>
        </div>
      </div>
      <div class="username">
        {{ username(account) }}
      </div>
      <div class="account">
        @{{ account.acct }}
      </div>
      <div class="note" v-html="account.note" @click.capture.prevent="noteClick"></div>
    </div>
  </div>
  <el-row class="basic-info">
    <el-col :span="8" :class="activeTab === 1 ? 'info info-active' : 'info'" @click="changeTab">
      <el-button type="text" class="tab" @click="changeTab(1)">
        <div class="title">{{ $t('side_bar.account_profile.toots') }}</div>
        <div class="count">{{ account.statuses_count }}</div>
      </el-button>
    </el-col>
    <el-col :span="8" :class="activeTab === 2 ? 'info info-active' : 'info'">
      <el-button type="text" class="tab" @click="changeTab(2)">
        <div class="title">{{ $t('side_bar.account_profile.follows') }}</div>
        <div class="count">{{ account.following_count }}</div>
      </el-button>
    </el-col>
    <el-col :span="8" :class="activeTab === 3 ? 'info info-active' : 'info'">
      <el-button type="text" class="tab" @click="changeTab(3)">
        <div class="title">{{ $t('side_bar.account_profile.followers') }}</div>
        <div class="count">{{ account.followers_count }}</div>
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

<script>
import { mapState } from 'vuex'
import { shell } from 'electron'
import Timeline from './AccountProfile/Timeline'
import Follows from './AccountProfile/Follows'
import Followers from './AccountProfile/Followers'

export default {
  name: 'account-profile',
  components: {
    Timeline,
    Follows,
    Followers
  },
  data () {
    return {
      activeTab: 1
    }
  },
  computed: {
    ...mapState({
      user: state => state.TimelineSpace.account,
      theme: (state) => {
        return {
          '--theme-mask-color': state.App.theme.wrapper_mask_color,
          '--theme-border-color': state.App.theme.border_color,
          '--theme-primary-color': state.App.theme.primary_color
        }
      }
    }),
    ...mapState('TimelineSpace/Contents/SideBar/AccountProfile', {
      account: state => state.account,
      relationship: state => state.relationship,
      loading: state => state.loading,
      muting: state => state.relationship && state.relationship.muting,
      blocking: state => state.relationship && state.relationship.blocking
    })
  },
  watch: {
    account: function () {
      this.activeTab = 1
    },
    loading: function (newState, oldState) {
      this.$emit('change-loading', newState)
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
    noteClick (e) {
      const link = findLink(e.target)
      if (link !== null) {
        shell.openExternal(link)
      }
    },
    follow (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/follow', account)
        .catch(() => {
          this.$message({
            message: this.$t('message.follow_error'),
            type: 'error'
          })
        })
    },
    unfollow (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unfollow', account)
        .catch(() => {
          this.$message({
            message: this.$t('message.unfollow_error'),
            type: 'error'
          })
        })
    },
    changeTab (index) {
      this.activeTab = index
    },
    openBrowser (account) {
      shell.openExternal(account.url)
      this.$refs.popper.doClose()
    },
    addToList (account) {
      this.$store.dispatch('TimelineSpace/Modals/ListMembership/setAccount', account)
      this.$store.dispatch('TimelineSpace/Modals/ListMembership/changeModal', true)
      this.$refs.popper.doClose()
    },
    confirmMute (account) {
      this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/changeAccount', account)
      this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/changeModal', true)
      this.$refs.popper.doClose()
    },
    unmute (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unmute', account)
      this.$refs.popper.doClose()
    },
    block (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/block', account)
      this.$refs.popper.doClose()
    },
    unblock () {
    }
  }
}

function findLink (target) {
  if (target.localName === 'a') {
    return target.href
  }
  if (target.parentNode === undefined || target.parentNode === null) {
    return null
  }
  if (target.parentNode.getAttribute('class') === 'note') {
    return null
  }
  return findLink(target.parentNode)
}
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

    .follow-follower {
      text-align: left;

      .follower-status {
        .status {
          border-radius: 4px;
          background-color: rgba(0, 0, 0, 0.3);
          padding: 4px 8px;
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

      .more {
        .menu-list {
          padding: 0;
          font-size: calc(var(--base-font-size) * 0.8);
          list-style-type: none;
          line-height: 20px;
          text-align: left;
          color: #303133;

          li {
            box-sizing: border-box;
            padding-left: 0.5em;
            padding-bottom: 0.5em;

            &:hover {
              background-color: #f2f6fc;
              cursor: pointer;
            }
          }
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

    .account {
      color: #409eff;
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
