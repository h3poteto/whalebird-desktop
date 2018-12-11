<template>
<div
  class="status"
  tabIndex="0"
  v-shortkey="shortcutEnabled ? {next: ['j'], prev: ['k'], right: ['l'], left: ['h'], reply: ['r'], boost: ['b'], fav: ['f'], open: ['o'], profile: ['p'], image: ['i'], cw: ['x']} : {}"
  @shortkey="handleTootControl"
  ref="status"
  @click="$emit('selectToot')"
  role="article"
  aria-label="toot"
  >
  <div v-show="filtered(message)" class="filtered">
    Filtered
  </div>
  <div v-show="!filtered(message)" class="toot">
    <div class="icon">
      <FailoverImg
        :src="originalMessage(message).account.avatar"
        @click="openUser(originalMessage(message).account)"
        :alt="`Avatar of ${originalMessage(message).account.username}`"
        />
    </div>
    <div class="detail" v-on:dblclick="openDetail(message)">
      <div class="toot-header">
        <div class="user" @click="openUser(originalMessage(message).account)">
          <span class="display-name" @click="openUser(message.account)"><bdi v-html="username(originalMessage(message).account)"></bdi></span>
          <span class="acct">{{ accountName(originalMessage(message).account) }}</span>
        </div>
        <div class="timestamp">
          <time :datetime="originalMessage(message).created_at" :title="readableTimestamp">
            {{ timestamp }}
          </time>
        </div>
        <div class="clearfix"></div>
      </div>
      <div class="content-wrapper">
        <div class="spoiler" v-show="spoilered(message)">
          <span v-html="spoilerText(message)"></span>
          <el-button v-if="!isShowContent(message)" plain type="primary" size="medium" class="spoil-button" @click="showContent = true">
            {{ $t('cards.toot.show_more') }}
          </el-button>
          <el-button v-else type="primary" size="medium" class="spoil-button" @click="showContent = false">
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
          <el-button v-show="sensitive(message) && isShowAttachments(message)" class="hide-sensitive" type="text" @click="showAttachments = false" :title="$t('cards.toot.hide')">
            <icon name="eye" class="hide"></icon>
          </el-button>
          <div class="media" v-bind:key="media.preview_url" v-for="media in mediaAttachments(message)">
            <FailoverImg :src="media.preview_url" @click="openImage(media.url, mediaAttachments(message))" :title="media.description" />
            <el-tag class="media-label" size="mini" v-if="media.type == 'gifv'">GIF</el-tag>
            <el-tag class="media-label" size="mini" v-else-if="media.type == 'video'">VIDEO</el-tag>
          </div>
        </div>
        <div class="clearfix"></div>
      </div>
      <div class="reblogger" v-show="message.reblog !== null">
        <icon name="retweet"></icon>
        <span class="reblogger-icon" @click="openUser(message.account)">
          <FailoverImg
            :src="message.account.avatar"
            :alt="`Avatar of ${message.account.username}`" />
        </span>
        <span class="reblogger-name" @click="openUser(message.account)" :title="`Reblogged by ${message.account.username}`" :aria-label="`Reblogged by ${message.account.username}`">
          <bdi v-html="username(message.account)"></bdi>
        </span>
      </div>
      <div class="tool-box">
        <el-button type="text" @click="openReply(message)" class="reply" :title="$t('cards.toot.reply')">
          <icon name="reply" scale="0.9"></icon>
        </el-button>
        <el-button v-show="locked(message)" type="text" class="locked">
          <icon name="lock" scale="0.9"></icon>
        </el-button>
        <el-button v-show="directed(message)" type="text" class="directed">
          <icon name="envelope" scale="0.9"></icon>
        </el-button>
        <el-button v-show="!locked(message)&&!directed(message)" type="text" @click="changeReblog(originalMessage(message))" :class="originalMessage(message).reblogged ? 'reblogged' : 'reblog'" :title="$t('cards.toot.reblog')">
          <icon name="retweet" scale="0.9"></icon>
        </el-button>
        <span class="count">
          {{ reblogsCount(message) }}
        </span>
        <el-button type="text" @click="changeFavourite(originalMessage(message))" :class="originalMessage(message).favourited ? 'favourited animated bounceIn' : 'favourite'" :title="$t('cards.toot.fav')">
          <icon name="star" scale="0.9"></icon>
        </el-button>
        <span class="count">
          {{ favouritesCount(message) }}
        </span>
        <el-button class="pinned" type="text" :title="$t('cards.toot.pinned')" v-show="pinned">
          <icon name="thumbtack" scale="0.9"></icon>
        </el-button>
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
              <li role="button" class="separate" @click="confirmMute(message)">
                {{ $t('cards.toot.mute') }}
              </li>
              <li role="button" @click="block(message)">
                {{ $t('cards.toot.block') }}
              </li>
              <li role="button" @click="reportUser(message)" v-if="!isMyMessage(message)">
                {{ $t('cards.toot.report') }}
              </li>
              <li role="button" class="separate" @click="deleteToot(message)" v-if="isMyMessage(message)">
                {{ $t('cards.toot.delete') }}
              </li>
            </ul>
          </div>
          <el-button slot="reference" type="text" :title="$t('cards.toot.detail')">
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
import { findAccount, findLink, findTag } from '~/src/renderer/utils/tootParser'
import DisplayStyle from '~/src/constants/displayStyle'
import TimeFormat from '~/src/constants/timeFormat'
import emojify from '~/src/renderer/utils/emojify'
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'
import { setInterval, clearInterval } from 'timers'

export default {
  name: 'toot',
  components: {
    FailoverImg
  },
  data () {
    return {
      showContent: false,
      showAttachments: false,
      now: Date.now()
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
    },
    focused: {
      type: Boolean,
      default: false
    },
    overlaid: {
      type: Boolean,
      default: false
    },
    pinned: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      displayNameStyle: state => state.App.displayNameStyle,
      timeFormat: state => state.App.timeFormat,
      language: state => state.App.language
    }),
    shortcutEnabled: function () {
      return this.focused && !this.overlaid
    },
    timestamp: function () {
      return this.parseDatetime(this.originalMessage(this.message).created_at, this.now)
    },
    readableTimestamp: function () {
      moment.locale(this.language)
      return moment(this.originalMessage(this.message).created_at).format('LLLL')
    }
  },
  mounted () {
    if (this.focused) {
      this.$refs.status.focus()
    }
    this.updateInterval = setInterval(() => {
      this.$data.now = Date.now()
    }, 60000)
  },
  beforeDestroy () {
    clearInterval(this.updateInterval)
  },
  watch: {
    focused: function (newState, oldState) {
      if (newState) {
        this.$nextTick(function () {
          this.$refs.status.focus()
        })
      } else if (oldState && !newState) {
        this.$nextTick(function () {
          this.$refs.status.blur()
        })
      }
    }
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
            return emojify(account.display_name, account.emojis)
          } else {
            return account.acct
          }
        case DisplayStyle.DisplayName.value:
          if (account.display_name !== '') {
            return emojify(account.display_name, account.emojis)
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
    parseDatetime (datetime, epoch) {
      switch (this.timeFormat) {
        case TimeFormat.Absolute.value:
          return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        case TimeFormat.Relative.value:
          moment.locale(this.language)
          return moment(datetime).from(epoch)
      }
    },
    tootClick (e) {
      const parsedTag = findTag(e.target, 'toot')
      if (parsedTag !== null) {
        const tag = `/${this.$route.params.id}/hashtag/${parsedTag}`
        this.$router.push({ path: tag })
        return tag
      }
      const parsedAccount = findAccount(e.target, 'toot')
      if (parsedAccount !== null) {
        this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
        this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/searchAccount', parsedAccount)
          .then((account) => {
            this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
            this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
          })
          .catch((err) => {
            console.error(err)
            this.openLink(e)
            this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', false)
          })
        return parsedAccount.acct
      }
      this.openLink(e)
    },
    openLink (e) {
      const link = findLink(e.target, 'toot')
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
    reportUser (message) {
      this.$store.dispatch('TimelineSpace/Modals/Report/openReport', this.originalMessage(message))
      this.$refs.popper.doClose()
    },
    confirmMute (message) {
      this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/changeAccount', this.originalMessage(message).account)
      this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/changeModal', true)
      this.$refs.popper.doClose()
    },
    block (message) {
      this.$store.dispatch('molecules/Toot/block', this.originalMessage(message).account)
      this.$refs.popper.doClose()
    },
    changeReblog (message) {
      if (message.reblogged) {
        this.$store.dispatch('molecules/Toot/unreblog', message)
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
        this.$store.dispatch('molecules/Toot/reblog', message)
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
        this.$store.dispatch('molecules/Toot/removeFavourite', message)
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
        this.$store.dispatch('molecules/Toot/addFavourite', message)
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
          mediaList: rawMediaList
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
      this.$store.dispatch('molecules/Toot/deleteToot', message)
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
    },
    handleTootControl (event) {
      switch (event.srcKey) {
        case 'next':
          this.$emit('focusNext')
          break
        case 'prev':
          this.$emit('focusPrev')
          break
        case 'right':
          this.$emit('focusRight')
          break
        case 'left':
          this.$emit('focusLeft')
          break
        case 'reply':
          this.openReply(this.message)
          break
        case 'boost':
          this.changeReblog(this.message)
          break
        case 'fav':
          this.changeFavourite(this.message)
          break
        case 'open':
          this.openDetail(this.message)
          break
        case 'profile':
          this.openUser(this.originalMessage(this.message).account)
          break
        case 'image':
          const images = this.mediaAttachments(this.message)
          if (images.length === 0) {
            return 0
          }
          this.openImage(images[0].url, images)
          break
        case 'cw':
          this.showContent = !this.showContent
          this.showAttachments = !this.showAttachments
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.toot {
  padding: 8px 0 0 16px;

  .fa-icon {
    font-size: 0.9em;
    width: auto;
    height: 1em;
    max-width: 100%;
    max-height: 100%;
  }

  .icon {
    float: left;

    img {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      display: block;
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

        .display-name /deep/ {
          font-weight: 800;
          color: var(--theme-primary-color);

          .emojione {
            max-width: 14px;
            max-height: 14px;
          }
        }

        .acct {
          font-weight: normal;
          color: var(--theme-secondary-color);
        }
      }

      .timestamp {
        font-size: var(--base-font-size);
        text-align: right;
        color: #909399;
        float: right;
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

    .spoiler {
      margin: 8px 0;

      .spoil-button {
        background-color: var(--theme-selected-background-color);
        border-color: var(--theme-border-color);
        padding: 2px 4px;
      }
    }

    .attachments {
      position: relative;
      margin: 4px 0 8px;

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
        margin-bottom: 4px;
        width: 200px;
        height: 200px;

        img {
          cursor: zoom-in;
          object-fit: cover;
          max-width: 200px;
          max-height: 200px;
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }

        .media-label {
          position: absolute;
          bottom: 6px;
          left: 4px;
          color: #fff;
          background-color: rgba(0, 0, 0, 0.3);
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

      .reblogger-name /deep/ {
        font-size: calc(var(--base-font-size) * 0.86);
        cursor: pointer;

        .emojione {
          max-width: 10px;
          max-height: 10px;
        }
      }
    }

    .tool-box {
      float: left;

      .fa-icon {
        vertical-align: bottom;
      }

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

      .pinned {
        color: gold;
      }

      .toot-menu {
        padding: 2px 0;
        border-color: #909399;

        .menu-list {
          padding: 0;
          margin: 4px 0;
          font-size: 0.9rem;
          list-style-type: none;
          line-height: 32px;
          text-align: left;
          color: #303133;

          li {
            box-sizing: border-box;
            padding: 0 32px 0 16px;

            &:hover {
              background-color: #409eff;
              color: #fff;
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
