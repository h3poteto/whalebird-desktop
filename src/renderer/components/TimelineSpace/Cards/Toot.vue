<template>
  <div class="toot">
    <div class="icon">
      <img :src="contributorIcon(message)" />
    </div>
    <div class="detail">
      <div class="toot-header">
        <div class="user">
          {{ contributorName(message) }}
        </div>
        <div class="timestamp">
          {{ parseDatetime(message.created_at) }}
        </div>
      </div>
      <div class="content" v-html="message.content" @click.capture.prevent="tootClick"></div>
      <div class="reblogger" v-if="message.reblog !== null">
        <icon name="retweet"></icon>
        <span class="reblogger-icon">
          <img :src="message.account.avatar" />
        </span>
        <span class="reblogger-name">
          {{ message.account.display_name }}
        </span>
      </div>
      <div class="tool-box">
        <el-button type="text" @click="openReply(message)">
          <icon name="reply" scale="0.9"></icon>
        </el-button>
        <el-button type="text" @click="changeReblog(message)" :class="message.reblogged ? 'reblogged' : ''">
          <icon name="retweet" scale="0.9"></icon>
        </el-button>
        <el-button type="text" @click="changeFavourite(message)" :class="message.favourited ? 'favourited' : ''">
          <icon name="star" scale="0.9"></icon>
        </el-button>
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
  name: 'toot',
  props: ['message'],
  methods: {
    contributorIcon (message) {
      if (message.reblog !== null) {
        return message.reblog.account.avatar
      } else {
        return message.account.avatar
      }
    },
    contributorName (message) {
      if (message.reblog !== null) {
        return message.reblog.account.display_name
      } else {
        return message.account.display_name
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
    openReply (message) {
      this.$store.dispatch('TimelineSpace/NewTootModal/openReply', message)
    },
    changeReblog (message) {
      if (message.reblogged) {
        this.$store.dispatch('TimelineSpace/Cards/Toot/unreblog', message)
          .then((data) => {
            this.$emit('update', data)
          })
          .catch(() => {
            this.$message({
              message: 'Faild to unreblog',
              type: 'error'
            })
          })
      } else {
        this.$store.dispatch('TimelineSpace/Cards/Toot/reblog', message)
          .then((data) => {
            this.$emit('update', data)
          })
          .catch(() => {
            this.$message({
              message: 'Faild to reblog',
              type: 'error'
            })
          })
      }
    },
    changeFavourite (message) {
      if (message.favourited) {
        this.$store.dispatch('TimelineSpace/Cards/Toot/removeFavourite', message)
          .then((data) => {
            this.$emit('update', data)
          })
          .catch(() => {
            this.$message({
              message: 'Failed to unfavourite',
              type: 'error'
            })
          })
      } else {
        this.$store.dispatch('TimelineSpace/Cards/Toot/addFavourite', message)
          .then((data) => {
            this.$emit('update', data)
          })
          .catch(() => {
            this.$message({
              message: 'Failed to favourite',
              type: 'error'
            })
          })
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
  return findLink(target.parentNode)
}
</script>

<style lang="scss" scoped>
.fill-line {
  height: 1px;
  background-color: #f2f6fc;
  margin: 4px 0;
}

.toot {
  .icon {
    float: left;

    img {
      width: 36px;
      height: 36px;
      border-radius: 4px;
    }
  }

  .detail {
    margin-left: 42px;
    margin-right: 8px;
    margin-top: 8px;

    .toot-header {
      .user {
        float: left;
        font-weight: 800;
        color: #303133;
        font-size: 14px;
      }

      .timestamp {
        font-size: 14px;
        text-align: right;
        width: 100%;
        color: #909399;
      }
    }

    .content {
      font-size: 14px;
      color: #303133;
      margin: 4px 0 8px;
    }

    .reblogger {
      color: #909399;

      .reblogger-icon {
        img {
          width: 16px;
          height: 16px;
          border-radius: 2px;
        }
      }

      .reblogger-name {
        font-size: 12px;
      }
    }

    .tool-box {
      button {
        margin: 0 8px;
        padding: 0;
        color: #909399;
      }

      .reblogged {
        color: #409eff;
      }

      .favourited {
        color: #e6a23c;
      }
    }
  }
}
</style>
