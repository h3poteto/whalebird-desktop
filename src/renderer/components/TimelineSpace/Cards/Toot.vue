<template>
  <div class="toot" tabIndex="0">
    <div class="icon">
      <img :src="originalMessage(message).account.avatar" />
    </div>
    <div class="detail">
      <div class="toot-header">
        <div class="user">
          {{ originalMessage(message).account.display_name }}
        </div>
        <div class="timestamp">
          {{ parseDatetime(message.created_at) }}
        </div>
      </div>
      <div class="content" v-html="message.content" @click.capture.prevent="tootClick"></div>
      <div class="attachments">
        <div class="media" v-for="media in originalMessage(message).media_attachments">
          <img :src="media.preview_url" />
        </div>
      </div>
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
        <el-button type="text" @click="openReply(message)" class="reply">
          <icon name="reply" scale="0.9"></icon>
        </el-button>
        <el-button type="text" @click="changeReblog(originalMessage(message))" :class="originalMessage(message).reblogged ? 'reblogged' : 'reblog'">
          <icon name="retweet" scale="0.9"></icon>
        </el-button>
        <el-button type="text" @click="changeFavourite(originalMessage(message))" :class="originalMessage(message).favourited ? 'favourited' : 'favourite'">
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
    originalMessage (message) {
      if (message.reblog !== null) {
        return message.reblog
      } else {
        return message
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
  background-color: #ebeef5;
  margin: 4px 0 0;
}

.toot {
  padding: 4px 0 0 16px;
  background-color: #ffffff;

  .icon {
    float: left;

    img {
      width: 36px;
      height: 36px;
      border-radius: 4px;
    }
  }

  .detail {
    margin: 0 8px 0 42px;

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
      word-wrap: break-word;
    }

    .attachments {
      .media {
        img {
          width: 200px;
          max-width: 100%;
          border-radius: 8px;
        }
      }
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

    .reply:hover,
    .reblog:hover,
    .favourite:hover {
      color: #409eff;
    }
  }
}

.toot:focus {
  background-color: #f2f6fc;
  outline: 0;
}
</style>
