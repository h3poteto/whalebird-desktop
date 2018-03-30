<template>
<div id="account_profile">
  <div class="header-background" v-bind:style="{ backgroundImage: 'url(' + account.header + ')' }">
    <div class="header">
      <div class="follow-follower" v-if="relationship !== null && relationship !== ''">
        <div class="follower-status">
          <span class="status" v-if="relationship.followed_by">Follows you</span>
          <span class="status" v-else>Doesn't follow you</span>
        </div>
        <div class="follow-status">
          <div v-if="relationship.following" class="unfollow" @click="unfollow(account)">
            <icon name="user-times" scale="1.5"></icon>
          </div>
          <div v-else class="follow" @click="follow(account)">
            <icon name="user-plus" scale="1.5"></icon>
          </div>
        </div>
        <div class="clearfix"></div>
      </div>
      <div class="icon">
        <img :src="account.avatar" />
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
    <el-col :span="8"class="info">
      <div class="title">Toots</div>
      <div class="count">{{ account.statuses_count }}</div>
    </el-col>
    <el-col :span="8"class="info">
      <div class="title">Follows</div>
      <div class="count">{{ account.following_count }}</div>
    </el-col>
    <el-col :span="8"class="info">
      <div class="title">Followers</div>
      <div class="count">{{ account.followers_count }}</div>
    </el-col>
  </el-row>
  <div class="timeline">
    Comming soon...
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import { shell } from 'electron'

export default {
  name: 'account-profile',
  computed: {
    ...mapState({
      account: state => state.TimelineSpace.Contents.SideBar.AccountProfile.account,
      relationship: state => state.TimelineSpace.Contents.SideBar.AccountProfile.relationship
    })
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
            message: 'Could not follow this user',
            type: 'error'
          })
        })
    },
    unfollow (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unfollow', account)
        .catch(() => {
          this.$message({
            message: 'Could not unfollow this user',
            type: 'error'
          })
        })
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
.header-background {
  background-position: 50% 50%;
  background-size: cover;
}

.header {
  background-color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 12px;
  box-sizing: border-box;
  word-wrap: break-word;
  font-size: 14px;

  .follow-follower {
    .follower-status {
      float: left;

      .status {
        border-radius: 4px;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 4px 8px;
      }
    }
    .follow-status {
      float: right;

      .follow {
        cursor: pointer;
      }

      .unfollow {
        color: #409eff;
        cursor: pointer;
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

  .username {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 24px;
    margin: 0 auto 12px auto;
  }

  .account {
    color: #409eff;
  }
}

.basic-info {
  border-top: solid 1px #dcdfe6;
  border-bottom: solid 1px #dcdfe6;

  .info {
    border-left: solid 1px #dcdfe6;
    padding: 8px 4px;

    .title {
      font-size: 10px;
      color: #909399;
    }

    .count {
      font-weight: 800;
    }
  }

  .info:first-of-type {
    border: none;
  }
}

.timeline {
  font-size: 12px;
  padding: 12px;
}
</style>
