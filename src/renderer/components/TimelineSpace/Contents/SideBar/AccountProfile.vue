<template>
<div id="account_profile">
  <div class="header-background" v-bind:style="{ backgroundImage: 'url(' + account.header + ')' }">
    <div class="header">
      <div class="follow-follower" v-if="relationship !== null">
        <div class="follower-status">
        </div>
        <div class="follow-status">
          <icon name="user-times" scale="1.5" class="unfollow" v-if="relationship.following"></icon>
          <icon name="user-plus" scale="1.5" class="follow" v-else></icon>
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
      <div class="title">Posts</div>
      <div class="count">{{ account.statuses_count }}</div>
    </el-col>
    <el-col :span="8"class="info">
      <div class="title">Following</div>
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
    }
    .follow-status {
      float: right;

      .unfollow {
        color: #409eff;
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
