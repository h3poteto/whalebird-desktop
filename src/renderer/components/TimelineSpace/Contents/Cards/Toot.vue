<template>
  <div class="toot" tabIndex="0">
    <div class="icon">
      <img :src="originalMessage(message).account.avatar" @click="openUser(originalMessage(message).account)"/>
    </div>
    <div class="detail" v-on:dblclick="openDetail(message)">
      <div class="toot-header">
        <div class="user" @click="openUser(originalMessage(message).account)">
          <span class="display-name">{{ username(originalMessage(message).account) }}</span>
          <span class="acct">{{ accountName(originalMessage(message).account) }}</span>
        </div>
        <div class="timestamp">
          {{ parseDatetime(originalMessage(message).created_at) }}
        </div>
        <div class="clearfix"></div>
      </div>
      <div class="content-wrapper">
        <div class="spoiler" v-show="spoilered(message)">
          {{ originalMessage(message).spoiler_text }}
          <el-button v-show="!isShowContent(message)" type="text" @click="showContent = true">
            Show more
          </el-button>
          <el-button v-show="isShowContent(message)" type="text" @click="showContent = false">
            Hide
          </el-button>
        </div>
        <div class="content" v-show="isShowContent(message)" v-html="originalMessage(message).content" @click.capture.prevent="tootClick"></div>
      </div>
      <div class="attachments">
        <el-button v-show="sensitive(message) && !isShowAttachments(message)" class="show-sensitive" type="info" @click="showAttachments = true">
          Show sensitive contents
        </el-button>
        <div v-show="isShowAttachments(message)">
          <el-button v-show="sensitive(message) && isShowAttachments(message)" class="hide-sensitive" type="text" @click="showAttachments = false">
            <icon name="eye" class="hide"></icon>
          </el-button>
          <div class="media" v-for="media in mediaAttachments(message)">
            <img :src="media.preview_url" @click="openImage(media.url, mediaAttachments(message))"/>
          </div>
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
        <span class="count">
          {{ reblogsCount(message) }}
        </span>
        <el-button type="text" @click="changeFavourite(originalMessage(message))" :class="originalMessage(message).favourited ? 'favourited animated bounceIn' : 'favourite'">
          <icon name="star" scale="0.9"></icon>
        </el-button>
        <span class="count">
          {{ favouritesCount(message) }}
        </span>
        <popper trigger="click" :options="{placement: 'bottom'}">
          <div class="popper toot-menu">
            <ul class="menu-list">
              <li role="button" @click="openDetail(message)">
                View Toot Detail
              </li>
              <li role="button" @click="openBrowser(message)">
                Open in Browser
              </li>
              <li role="button" @click="copyLink(message)">
                Copy Link to Toot
              </li>
              <li role="button" class="separate" @click="deleteToot(message)" v-if="isMyMessage(message)">
                Delete
              </li>
            </ul>
          </div>
          <el-button slot="reference" type="text">
            <icon name="ellipsis-h" scale="0.9"></icon>
          </el-button>
        </popper>
      </div>
      <div class="application" v-if="application(message) !== null">
        via {{ application(message) }}
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="fill-line"></div>
  </div>
</template>

<script>
import moment from 'moment'
import { shell, clipboard } from 'electron'
import { mapState } from 'vuex'

export default {
  name: 'toot',
  data () {
    return {
      showContent: false,
      showAttachments: false
    }
  },
  props: ['message'],
  computed: {
    ...mapState({
      displayNameStyle: state => state.App.displayNameStyle
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
      switch (this.displayNameStyle) {
        case 0:
          if (account.display_name !== '') {
            return account.display_name
          } else {
            return account.username
          }
        case 1:
          if (account.display_name !== '') {
            return account.display_name
          } else {
            return account.username
          }
        case 2:
          return `@${account.username}`
      }
    },
    accountName (account) {
      switch (this.displayNameStyle) {
        case 0:
          return `@${account.username}`
        case 1:
          return ''
        case 2:
          return ''
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
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openReply', this.originalMessage(message))
    },
    openDetail (message) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openTootComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/changeToot', message)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    openBrowser (message) {
      shell.openExternal(message.url)
    },
    copyLink (message) {
      clipboard.writeText(message.url, 'toot-link')
    },
    changeReblog (message) {
      if (message.reblogged) {
        this.$store.dispatch('TimelineSpace/Contents/Cards/Toot/unreblog', message)
          .then((data) => {
            this.$emit('update', data)
          })
          .catch(() => {
            this.$message({
              message: 'Failed to unreblog',
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
              message: 'Failed to reblog',
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
    openImage (url, rawMediaList) {
      const mediaList = rawMediaList.map((media) => {
        return media.url
      })
      const currentIndex = mediaList.indexOf(url)
      this.$store.dispatch(
        'TimelineSpace/Modals/ImageViewer/openModal',
        {
          currentIndex: currentIndex,
          mediaList: mediaList
        })
    },
    openUser (account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    mediaAttachments (message) {
      return this.originalMessage(message).media_attachments
    },
    reblogsCount (message) {
      if (this.originalMessage(message).reblogs_count > 0) {
        return this.originalMessage(message).reblogs_count
      }
      return ''
    },
    favouritesCount (message) {
      if (this.originalMessage(message).favourites_count > 0) {
        return this.originalMessage(message).favourites_count
      }
      return ''
    },
    isMyMessage (message) {
      return this.$store.state.TimelineSpace.account.accountId === this.originalMessage(message).account.id
    },
    deleteToot (message) {
      this.$store.dispatch('TimelineSpace/Contents/Cards/Toot/deleteToot', message)
        .then((message) => {
          this.$emit('delete', message)
        })
        .catch(() => {
          this.$message({
            message: 'Failed to delete the toot',
            type: 'error'
          })
        })
    },
    application (message) {
      let msg = this.originalMessage(message)
      if (msg.application !== undefined &&
          msg.application !== null) {
        return msg.application.name
      }
      return null
    },
    spoilered (message) {
      return this.originalMessage(message).spoiler_text.length > 0
    },
    isShowContent (message) {
      return !this.spoilered(message) || this.showContent
    },
    sensitive (message) {
      return this.originalMessage(message).sensitive && this.mediaAttachments(message).length > 0
    },
    isShowAttachments (message) {
      return !this.sensitive(message) || this.showAttachments
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
  padding: 8px 0 0 16px;

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
    margin: 0 8px 0 8px;
    float: left;
    width: calc(100% - 52px);

    .toot-header {
      .user {
        float: left;
        font-size: var(--base-font-size);
        cursor: pointer;
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;

        .display-name {
          font-weight: 800;
          color: var(--theme-primary-color);
        }

        .acct {
          font-weight: normal;
          color: var(--theme-secondary-color);
        }
      }

      .timestamp {
        font-size: var(--base-font-size);
        text-align: right;
        width: 100%;
        color: #909399;
        flota: right;
      }
    }

    .content-wrapper {
      font-size: var(--base-font-size);
      color: var(--theme-primary-color);

      .content {
        margin: 4px 0 8px;
        word-wrap: break-word;
      }
    }

    .attachments {
      position: relative;

      .show-sensitive {
        padding: 20px 32px;
        margin-bottom: 4px;
      }

      .hide-sensitive {
        position: absolute;
        top: 2px;
        left: 2px;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 4px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.9);
        }
      }

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
        font-size: calc(var(--base-font-size) * 0.86);
        cursor: pointer;
      }
    }

    .tool-box {
      float: left;

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

      .count {
        font-size: 0.8em;
        color: #909399;
        margin: 0 0 4px -8px;
      }

      .toot-menu {
        .menu-list {
          padding: 0;
          margin: 4px 0;
          font-size: 0.8em;
          list-style-type: none;
          line-height: 20px;
          text-align: left;
          color: #303133;

          li {
            box-sizing: border-box;
            margin: 0;
            padding: 0 1.1em 0.5em;

            &:hover {
              background-color: #f2f6fc;
              cursor: pointer;
            }

            &.separate {
              border-top: 1px solid var(--theme-border-color);
              padding-top: 4px;
              margin-top: 2px;
            }
          }
        }
      }
    }

    .application {
      float: right;
      color: #909399;
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
  background-color: var(--theme-selected-background-color);
  outline: 0;
}
</style>
