<template>
<div class="status" tabIndex="0">
  <div v-show="filtered(message)" class="filtered">
    Filtered
  </div>
  <div v-show="!filtered(message)" class="toot">
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
          <span v-html="spoilerText(message)"></span>
          <el-button v-show="!isShowContent(message)" type="text" @click="showContent = true">
            {{ $t('cards.toot.show_more') }}
          </el-button>
          <el-button v-show="isShowContent(message)" type="text" @click="showContent = false">
            {{ $t('cards.toot.hide')}}
          </el-button>
        </div>
        <div class="content" v-show="isShowContent(message)" v-html="status(message)" @click.capture.prevent="tootClick"></div>
      </div>
      <div class="attachments">
        <el-button v-show="sensitive(message) && !isShowAttachments(message)" class="show-sensitive" type="info" @click="showAttachments = true">
          {{ $t('cards.toot.sensitive') }}
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
      <div class="reblogger" v-show="message.reblog !== null">
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
        <el-button v-show="locked(message)" type="text" class="locked">
          <icon name="lock" scale="0.9"></icon>
        </el-button>
        <el-button v-show="directed(message)" type="text" class="directed">
          <icon name="envelope" scale="0.9"></icon>
        </el-button>
        <el-button v-show="!locked(message)&&!directed(message)" type="text" @click="changeReblog(originalMessage(message))" :class="originalMessage(message).reblogged ? 'reblogged' : 'reblog'">
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
        <popper trigger="click" :options="{placement: 'bottom'}" ref="popper">
          <div class="popper toot-menu">
            <ul class="menu-list">
              <li role="button" @click="openDetail(message)">
                {{ $t('cards.toot.view_toot_detail') }}
              </li>
              <li role="button" @click="openBrowser(originalMessage(message))">
                {{ $t('cards.toot.open_in_browser') }}
              </li>
              <li role="button" @click="copyLink(originalMessage(message))">
                {{ $t('cards.toot.copy_link_to_toot') }}
              </li>
              <li role="button" class="separate" @click="deleteToot(message)" v-show="isMyMessage(message)">
                {{ $t('cards.toot.delete') }}
              </li>
            </ul>
          </div>
          <el-button slot="reference" type="text">
            <icon name="ellipsis-h" scale="0.9"></icon>
          </el-button>
        </popper>
      </div>
      <div class="application" v-show="application(message) !== null">
        {{ $t('cards.toot.via', { application: application(message) }) }}
      </div>
    </div>
    <div class="clearfix"></div>
  </div>
  <div class="fill-line"></div>
</div>
</template>

<script>
import moment from 'moment'
import { shell, clipboard } from 'electron'
import { mapState } from 'vuex'
import { findAccount, findLink, isTag } from '../../../utils/link'
import DisplayStyle from '~/src/constants/displayStyle'
import emojify from '~/src/renderer/utils/emojify'

export default {
  name: 'toot',
  data () {
    return {
      showContent: false,
      showAttachments: false
    }
  },
  props: {
    message: {
      type: Object,
      default: {}
    },
    filter: {
      type: String,
      default: ''
    }
  },
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
        case DisplayStyle.DisplayNameAndUsername.value:
          if (account.display_name !== '') {
            return account.display_name
          } else {
            return account.acct
          }
        case DisplayStyle.DisplayName.value:
          if (account.display_name !== '') {
            return account.display_name
          } else {
            return account.acct
          }
        case DisplayStyle.Username.value:
          return account.acct
      }
    },
    accountName (account) {
      switch (this.displayNameStyle) {
        case DisplayStyle.DisplayNameAndUsername.value:
          return `@${account.acct}`
        case DisplayStyle.DisplayName.value:
        case DisplayStyle.Username.value:
          return ''
      }
    },
    parseDatetime (datetime) {
      return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
    },
    tootClick (e) {
      if (isTag(e.target)) {
        const tag = `/${this.$route.params.id}/hashtag/${e.target.innerText}`
        this.$router.push({ path: tag })
        return tag
      }
      const accountURL = findAccount(e.target)
      if (accountURL !== null) {
        this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
        this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/searchAccount', accountURL)
          .then((account) => {
            this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
            this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
          })
          .catch(() => {
            this.$message({
              message: this.$t('message.find_account_error'),
              type: 'error'
            })
            this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', false)
          })
        return accountURL
      }
      const link = findLink(e.target)
      if (link !== null) {
        return shell.openExternal(link)
      }
    },
    openReply (message) {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openReply', this.originalMessage(message))
    },
    openDetail (message) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openTootComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/changeToot', message)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
      this.$refs.popper.doClose()
    },
    openBrowser (message) {
      shell.openExternal(message.url)
      this.$refs.popper.doClose()
    },
    copyLink (message) {
      clipboard.writeText(message.url, 'toot-link')
      this.$refs.popper.doClose()
    },
    changeReblog (message) {
      if (message.reblogged) {
        this.$store.dispatch('TimelineSpace/Contents/Cards/Toot/unreblog', message)
          .then((data) => {
            this.$emit('update', data)
          })
          .catch(() => {
            this.$message({
              message: this.$t('message.unreblog_error'),
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
              message: this.$t('message.reblog_error'),
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
              message: this.$t('message.unfavourite_error'),
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
              message: this.$t('message.favourite_error'),
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
            message: this.$t('message.delete_error'),
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
    },
    filtered (message) {
      return this.filter.length > 0 && this.originalMessage(message).content.search(this.filter) >= 0
    },
    locked (message) {
      return message.visibility === 'private'
    },
    directed (message) {
      return message.visibility === 'direct'
    },
    status (message) {
      const original = this.originalMessage(message)
      return emojify(original.content, original.emojis)
    },
    spoilerText (message) {
      const original = this.originalMessage(message)
      return emojify(original.spoiler_text, original.emojis)
    }
  }
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

    .content-wrapper /deep/ {
      font-size: var(--base-font-size);
      color: var(--theme-primary-color);

      .content {
        margin: 4px 0 8px;
        word-wrap: break-word;
      }

      .emojione {
        width: 20px;
        height: 20px;
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

  .action-pop-over {
    color: #303133;
  }
}

.filtered {
  align-items: center;
  display: flex;
  height: 40px;
  justify-content: center;
}

.status:focus {
  background-color: var(--theme-selected-background-color);
  outline: 0;
}

.fill-line {
  height: 1px;
  background-color: var(--theme-border-color);
  margin: 4px 0 0;
}
</style>
