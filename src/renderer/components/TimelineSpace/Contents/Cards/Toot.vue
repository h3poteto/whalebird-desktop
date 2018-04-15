<template>
  <div class="toot" tabIndex="0" :style="theme">
    <div class="icon">
      <img :src="originalMessage(message).account.avatar" @click="openUser(originalMessage(message).account)"/>
    </div>
    <div class="detail" v-on:dblclick="openDetail(message)">
      <div class="toot-header">
        <div class="user" @click="openUser(originalMessage(message).account)">
          {{ username(originalMessage(message).account) }}
        </div>
        <div class="timestamp">
          {{ parseDatetime(message.created_at) }}
        </div>
      </div>
      <div class="content" v-html="message.content" @click.capture.prevent="tootClick"></div>
      <div class="attachments">
        <div class="media" v-for="media in originalMessage(message).media_attachments">
          <img :src="media.preview_url" @click="openImage(media.url)"/>
        </div>
        <div class="clearfix"></div>
      </div>
      <div class="reblogger" v-if="message.reblog !== null">
        <icon name="retweet"></icon>
        <span class="reblogger-icon" @click="openUser(message.account)">
          <img :src="message.account.avatar" />
        </span>
        <span class="reblogger-name" @click="openUser(message.account)">
          {{ username(message.account) }}
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
        <el-button type="text" v-popover="{ name: message.id }">
          <icon name="ellipsis-h" scale="0.9"></icon>
        </el-button>
        <toot-menu :key="message.id" :message="message" :name="message.id"></toot-menu>
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="fill-line"></div>
  </div>
</template>

<script>
import moment from 'moment'
import { shell } from 'electron'
import { mapState } from 'vuex'
import TootMenu from './Popover/TootMenu'

export default {
  name: 'toot',
  props: ['message'],
  components: { TootMenu },
  computed: {
    ...mapState({
      theme: (state) => {
        return {
          '--theme-primary-color': state.App.theme.primary_color,
          '--theme-selected-background-color': state.App.theme.selected_background_color,
          '--theme-border-color': state.App.theme.border_color
        }
      }
    })
  },
  methods: {
    originalMessage (message) {
      if (message.reblog !== null) {
        return message.reblog
      } else {
        return message
      }
    },
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
    openReply (message) {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openReply', message)
    },
    openDetail (message) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openTootComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/changeToot', message)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    openBrowser (message) {
      console.log(message)
    },
    changeReblog (message) {
      if (message.reblogged) {
        this.$store.dispatch('TimelineSpace/Contents/Cards/Toot/unreblog', message)
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
        this.$store.dispatch('TimelineSpace/Contents/Cards/Toot/reblog', message)
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
        this.$store.dispatch('TimelineSpace/Contents/Cards/Toot/removeFavourite', message)
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
        this.$store.dispatch('TimelineSpace/Contents/Cards/Toot/addFavourite', message)
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
    },
    openImage (url) {
      this.$store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', url)
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
  if (target.parentNode.getAttribute('class') === 'toot') {
    return null
  }
  return findLink(target.parentNode)
}
</script>

<style lang="scss" scoped>

.toot {
  --theme-primary-color: #303133;
  --theme-border-color: #ebeef5;

  padding: 4px 0 0 16px;

  .icon {
    float: left;

    img {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
    }
  }

  .detail {
    margin: 0 8px 0 42px;

    .toot-header {
      .user {
        float: left;
        font-weight: 800;
        color: var(--theme-primary-color);
        font-size: 14px;
        cursor: pointer;
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
      color: var(--theme-primary-color);
      margin: 4px 0 8px;
      word-wrap: break-word;
    }

    .attachments {
      .media {
        float: left;
        margin-right: 8px;
        img {
          cursor: zoom-in;
          max-width: 200px;
          max-height: 200px;
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
          cursor: pointer;
        }
      }

      .reblogger-name {
        font-size: 12px;
        cursor: pointer;
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

  .fill-line {
    height: 1px;
    background-color: var(--theme-border-color);
    margin: 4px 0 0;
  }

  .action-pop-over {
    color: #303133;
  }
}

.toot:focus {
  --theme-selected-background-color: #f2f6fc;
  background-color: var(--theme-selected-background-color);
  outline: 0;
}
</style>
