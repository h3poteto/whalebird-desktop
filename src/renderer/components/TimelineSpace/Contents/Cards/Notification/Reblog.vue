<template>
  <div class="reblog" tabIndex="0">
    <div class="action">
      <div class="action-mark">
        <icon name="retweet" scala="0.7"></icon>
      </div>
      <div class="action-detail">
        <span class="bold" @click="openUser(message.account)">{{ username(message.account) }}</span> boosted your status
      </div>
      <div class="action-icon">
        <img :src="message.account.avatar" />
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="target">
      <div class="icon">
        <img :src="message.status.account.avatar" />
      </div>
      <div class="detail">
        <div class="toot-header">
          <div class="user">
            {{ username(message.status.account) }}
          </div>
          <div class="timestamp">
            {{ parseDatetime(message.status.created_at) }}
          </div>
        </div>
        <div class="content" v-html="message.status.content" @click.capture.prevent="tootClick"></div>
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="fill-line"></div>
  </div>
</template>

<script>
import moment from 'moment'
import { shell } from 'electron'

export default {
  name: 'reblog',
  props: ['message'],
  methods: {
    username (account) {
      if (account.display_name !== '') {
        return account.display_name
      } else {
        return account.username
      }
    },
    parseDatetime (datetime) {
      return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
    },
    tootClick (e) {
      const link = findLink(e.target)
      if (link !== null) {
        shell.openExternal(link)
      }
    },
    openUser (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
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
  if (target.parentNode.getAttribute('class') === 'reblog') {
    return null
  }
  return findLink(target.parentNode)
}
</script>

<style lang="scss" scoped>
.fill-line {
  height: 1px;
  background-color: #f2f6fc;
  margin: 4px 0 0;
}

.bold {
  font-weight: bold;
}

.reblog {
  padding: 8px 0 0 16px;

  .action {
    margin-right: 8px;

    .action-mark {
      color: #409eff;
      float: left;
      width: 32px;
      text-align: right;
    }

    .action-detail {
      margin-left: 10px;
      font-size: 14px;
      float: left;
      max-width: 80%;

      .bold {
        cursor: pointer;
      }
    }

    .action-icon {
      width: 100%;
      text-align: right;

      img {
        width: 16px;
        height: 16px;
        border-radius: 2px;
      }
    }
  }

  .target {
    .icon {
      float: left;
      width: 42px;

      img {
        width: 32px;
        height: 32px;
        border-radius: 4px;
      }
    }

    .detail {
      margin: 8px 8px 0 42px;;
      color: #909399;

      .toot-header {
        .user {
          float: left;
          font-size: 14px;
        }

        .timestamp {
          font-size: 14px;
          text-align: right;
          width: 100%;
        }
      }

      .content {
        font-size: 14px;
        margin: 4px 0 8px;
      }
    }
  }
}

.reblog:focus {
  outline: 0;
  background-color: #f2f6fc;
}
</style>
