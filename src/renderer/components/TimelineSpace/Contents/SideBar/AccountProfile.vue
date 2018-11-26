<template>
<div id="account_profile"
     v-loading="loading"
     :element-loading-text="$t('message.loading')"
     element-loading-spinner="el-icon-loading"
     element-loading-background="rgba(0, 0, 0, 0.8)"
     role="article"
     aria-label="account profile">
  <div class="header-background" v-bind:style="{ backgroundImage: 'url(' + account.header + ')' }">
    <div class="header">
      <div class="follow-follower" v-if="relationship !== null && relationship !== '' && account.username!==user.username">
        <div class="follower-status">
          <el-tag class="status" size="small" v-if="relationship.followed_by">{{ $t('side_bar.account_profile.follows_you') }}</el-tag>
          <el-tag class="status" size="medium" v-else>{{ $t('side_bar.account_profile.doesnt_follow_you') }}</el-tag>
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
          <FailoverImg :src="account.avatar" :alt="`Avatar of ${account.username}`" />
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
      <div class="username" v-html="username(account)">
      </div>
      <div class="account">
        @{{ account.acct }}
      </div>
      <div class="note" v-html="note(account)" @click.capture.prevent="noteClick"></div>
    </div>
  </div>
  <div class="metadata">
    <dl v-for="(data, index) in account.fields" :key="index">
      <dt>
        {{ data.name }}
      </dt>
      <dd v-html="data.value" @click.capture.prevent="metadataClick">
      </dd>
    </dl>
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
import { findLink } from '~/src/renderer/utils/tootParser'
import emojify from '~/src/renderer/utils/emojify'
import Timeline from './AccountProfile/Timeline'
import Follows from './AccountProfile/Follows'
import Followers from './AccountProfile/Followers'
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'

export default {
  name: 'account-profile',
  components: {
    Timeline,
    Follows,
    Followers,
    FailoverImg
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
        return emojify(account.display_name, account.emojis)
      } else {
        return account.username
      }
    },
    note (account) {
      return emojify(account.note, account.emojis)
    },
    noteClick (e) {
      const link = findLink(e.target, 'note')
      if (link !== null) {
        shell.openExternal(link)
      }
    },
    follow (account) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true)
      try {
        this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/follow', account)
      } catch (err) {
        this.$message({
          message: this.$t('message.follow_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false)
      }
    },
    unfollow (account) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true)
      try {
        this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unfollow', account)
      } catch (err) {
        this.$message({
          message: this.$t('message.unfollow_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false)
      }
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
    unblock (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unblock', account)
      this.$refs.popper.doClose()
    },
    metadataClick (e) {
      const link = findLink(e.target, 'metadata')
      if (link !== null) {
        return shell.openExternal(link)
      }
    }
  }
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
          color: #fff;
          background-color: rgba(0, 0, 0, 0.3);
          font-size: 1rem;
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
        .popper {
          padding: 2px 0;
          border-color: #909399;
        }

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

      .icon {
        padding: 12px;

        img {
          width: 72px;
          border-radius: 8px;
        }
      }
    }

    .username /deep/ {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: calc(var(--base-font-size) * 1.71);
      margin: 0 auto 12px auto;

      .emojione {
        max-width: 1em;
        max-height: 1em;
      }
    }

    .account {
      color: #409eff;
    }

    .note {
      & /deep/ .emojione {
        max-width: 1.2em;
        height: 1.2em;
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
