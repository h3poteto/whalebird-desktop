<template>
  <div
    class="status"
    tabIndex="0"
    v-shortkey="
      shortcutEnabled
        ? {
            next: ['j'],
            prev: ['k'],
            right: ['l'],
            left: ['h'],
            reply: ['r'],
            boost: ['b'],
            fav: ['f'],
            open: ['o'],
            profile: ['p'],
            image: ['i'],
            cw: ['x']
          }
        : {}
    "
    @shortkey="handleTootControl"
    ref="status"
    @click="$emit('selectToot', message)"
    role="article"
    aria-label="toot"
  >
    <div v-show="filtered" class="filtered">Filtered</div>
    <div v-show="!filtered" class="toot">
      <div class="icon" role="presentation">
        <FailoverImg
          :src="originalMessage.account.avatar"
          @click="openUser(originalMessage.account)"
          :alt="`Avatar of ${originalMessage.account.username}`"
        />
      </div>
      <div class="detail" v-on:dblclick="openDetail(message)">
        <div class="toot-header">
          <div class="user" @click="openUser(originalMessage.account)">
            <span class="display-name"><bdi v-html="username(originalMessage.account)"></bdi></span>
            <span class="acct">{{ accountName(originalMessage.account) }}</span>
          </div>
          <div class="timestamp">
            <time :datetime="originalMessage.created_at" :title="readableTimestamp" @click="openDetail(message)">
              {{ timestamp }}
            </time>
          </div>
          <div class="clearfix"></div>
        </div>
        <div class="content-wrapper">
          <div class="spoiler" v-show="spoilered">
            <span v-html="emojiText(originalMessage.spoiler_text, originalMessage.emojis)"></span>
            <el-button v-if="!isShowContent" plain type="primary" size="medium" class="spoil-button" @click="showContent = true">
              {{ $t('cards.toot.show_more') }}
            </el-button>
            <el-button v-else type="primary" size="medium" class="spoil-button" @click="showContent = false">
              {{ $t('cards.toot.hide') }}
            </el-button>
          </div>
          <div
            class="content"
            v-show="isShowContent"
            v-html="emojiText(originalMessage.content, originalMessage.emojis)"
            @click.capture.prevent="tootClick"
          ></div>
          <Poll v-show="isShowContent" v-if="poll" :poll="poll" @vote="vote" @refresh="refresh"></Poll>
        </div>
        <div class="attachments">
          <el-button v-show="sensitive && !isShowAttachments" class="show-sensitive" type="info" @click="showAttachments = true">
            {{ $t('cards.toot.sensitive') }}
          </el-button>
          <div v-show="isShowAttachments">
            <el-button
              v-show="sensitive && isShowAttachments"
              class="hide-sensitive"
              type="text"
              @click="showAttachments = false"
              :title="$t('cards.toot.hide')"
            >
              <icon name="eye" class="hide"></icon>
            </el-button>
            <div class="media" v-bind:key="media.preview_url" v-for="media in mediaAttachments">
              <FailoverImg
                :src="media.preview_url"
                @click="openImage(media.url, mediaAttachments)"
                :title="media.description"
                :readExif="true"
              />
              <el-tag class="media-label" size="mini" v-if="media.type == 'gifv'">GIF</el-tag>
              <el-tag class="media-label" size="mini" v-else-if="media.type == 'video'">VIDEO</el-tag>
            </div>
          </div>
          <div class="clearfix"></div>
        </div>
        <Quote
          v-if="message.quote"
          :icon="message.reblog.account.avatar"
          :username="username(message.reblog.account)"
          :accountName="accountName(message.reblog.account)"
          :body="emojiText(message.reblog.content, message.reblog.emojis)"
          @select="openDetail(message.reblog)"
        />
        <LinkPreview
          v-if="originalMessage.card && originalMessage.card.type === 'link'"
          :icon="originalMessage.card.image"
          :title="originalMessage.card.title"
          :description="originalMessage.card.description"
          :url="originalMessage.card.url"
        />
        <div class="reblogger" v-show="message.reblog && !message.quote">
          <icon name="retweet"></icon>
          <span class="reblogger-icon" @click="openUser(message.account)" role="presentation">
            <FailoverImg :src="message.account.avatar" :alt="`Avatar of ${message.account.username}`" />
          </span>
          <span
            class="reblogger-name"
            @click="openUser(message.account)"
            :title="`Reblogged by ${message.account.username}`"
            :aria-label="`Reblogged by ${message.account.username}`"
          >
            <bdi v-html="username(message.account)"></bdi>
          </span>
        </div>
        <div class="emoji-reactions">
          <template v-for="reaction in originalMessage.emoji_reactions">
            <el-button v-if="reaction.me" type="success" size="medium" class="reaction" @click="removeReaction(reaction.name)"
              >{{ reaction.name }} {{ reaction.count }}</el-button
            >
            <el-button v-else type="text" size="medium" class="reaction" @click="addReaction(reaction.name)"
              >{{ reaction.name }} {{ reaction.count }}</el-button
            >
          </template>
        </div>
        <div class="tool-box">
          <el-button type="text" @click="openReply()" class="reply" :title="$t('cards.toot.reply')" :aria-label="$t('cards.toot.reply')">
            <icon name="reply" scale="0.9"></icon>
          </el-button>
          <el-button v-show="locked" type="text" class="locked">
            <icon name="lock" scale="0.9"></icon>
          </el-button>
          <el-button v-show="directed" type="text" class="directed">
            <icon name="envelope" scale="0.9"></icon>
          </el-button>
          <el-button
            v-show="!locked && !directed"
            type="text"
            @click="changeReblog(originalMessage)"
            :class="originalMessage.reblogged ? 'reblogged' : 'reblog'"
            :title="$t('cards.toot.reblog')"
          >
            <icon name="retweet" scale="0.9"></icon>
          </el-button>
          <span class="count">
            {{ reblogsCount }}
          </span>
          <el-button
            type="text"
            @click="changeFavourite(originalMessage)"
            :class="originalMessage.favourited ? 'favourited animated bounceIn' : 'favourite'"
            :title="$t('cards.toot.fav')"
            :aria-label="$t('cards.toot.fav')"
          >
            <icon name="star" scale="0.9"></icon>
          </el-button>
          <span class="count">
            {{ favouritesCount }}
          </span>
          <el-button
            @click="changeBookmark(originalMessage)"
            :class="originalMessage.bookmarked ? 'bookmarked' : 'bookmark'"
            type="text"
            :text="$t('cards.toot.bookmark')"
            :aria-label="$t('cards.toot.bookmark')"
            v-if="bookmarkSupported"
          >
            <icon name="bookmark" scale="0.9"></icon>
          </el-button>
          <el-button type="text" class="quote-btn" v-if="quoteSupported" @click="openQuote()">
            <icon name="quote-right" scale="0.9"></icon>
          </el-button>
          <template v-if="sns !== 'mastodon'">
            <el-popover
              placement="bottom"
              width="281"
              trigger="click"
              popper-class="status-emoji-picker"
              ref="status_emoji_picker"
              @show="openPicker"
              @hide="hidePicker"
            >
              <picker
                v-if="openEmojiPicker"
                set="emojione"
                :autoFocus="true"
                @select="selectEmoji"
                :sheetSize="32"
                :perLine="7"
                :emojiSize="24"
                :showPreview="false"
                :emojiTooltip="true"
              />
              <el-button slot="reference" class="emoji" type="text">
                <icon name="regular/smile" scale="0.9"></icon>
              </el-button>
            </el-popover>
          </template>
          <el-button class="pinned" type="text" :title="$t('cards.toot.pinned')" :aria-label="$t('cards.toot.pinned')" v-show="pinned">
            <icon name="thumbtack" scale="0.9"></icon>
          </el-button>
          <el-popover
            placement="bottom"
            width="200"
            trigger="click"
            popper-class="status-menu-popper"
            ref="status_menu_popper"
            @show="openMenu"
            @hide="hideMenu"
          >
            <ul class="menu-list" v-if="openToolMenu">
              <li role="button" @click="openDetail(message)" v-show="!detailed">
                {{ $t('cards.toot.view_toot_detail') }}
              </li>
              <li role="button" @click="openBrowser(originalMessage)">
                {{ $t('cards.toot.open_in_browser') }}
              </li>
              <li role="button" @click="copyLink(originalMessage)">
                {{ $t('cards.toot.copy_link_to_toot') }}
              </li>
              <li role="button" class="separate" @click="confirmMute()">
                {{ $t('cards.toot.mute') }}
              </li>
              <li role="button" @click="block()">
                {{ $t('cards.toot.block') }}
              </li>
              <li role="button" @click="reportUser()" v-if="!isMyMessage">
                {{ $t('cards.toot.report') }}
              </li>
              <li role="button" class="separate" @click="deleteToot(message)" v-if="isMyMessage">
                {{ $t('cards.toot.delete') }}
              </li>
            </ul>
            <el-button slot="reference" type="text" :title="$t('cards.toot.detail')">
              <icon name="ellipsis-h" scale="0.9"></icon>
            </el-button>
          </el-popover>
        </div>
        <div class="application" v-show="application !== null">
          {{ $t('cards.toot.via', { application: application }) }}
        </div>
      </div>
      <div class="clearfix"></div>
    </div>
    <div class="fill-line"></div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'
import { Picker } from 'emoji-mart-vue'
import ClickOutside from 'vue-click-outside'
import { findAccount, findLink, findTag } from '~/src/renderer/utils/tootParser'
import DisplayStyle from '~/src/constants/displayStyle'
import TimeFormat from '~/src/constants/timeFormat'
import emojify from '~/src/renderer/utils/emojify'
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'
import Poll from '~/src/renderer/components/molecules/Toot/Poll'
import LinkPreview from '~/src/renderer/components/molecules/Toot/LinkPreview'
import Quote from '@/components/molecules/Toot/Quote'
import { setInterval, clearInterval } from 'timers'
import QuoteSupported from '@/utils/quoteSupported'
import Filtered from '@/utils/filter'

export default {
  name: 'toot',
  directives: {
    ClickOutside
  },
  components: {
    FailoverImg,
    Poll,
    Picker,
    LinkPreview,
    Quote
  },
  data() {
    return {
      showContent: this.$store.state.App.ignoreCW,
      showAttachments: this.$store.state.App.ignoreNSFW,
      hideAllAttachments: this.$store.state.App.hideAllAttachments,
      now: Date.now(),
      openEmojiPicker: false,
      openToolMenu: false
    }
  },
  props: {
    message: {
      type: Object,
      default: {}
    },
    filters: {
      type: Array,
      default: []
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
    },
    detailed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('App', {
      displayNameStyle: state => state.displayNameStyle,
      timeFormat: state => state.timeFormat,
      language: state => state.language
    }),
    ...mapState('TimelineSpace', {
      sns: state => state.sns,
      account: state => state.account
    }),
    ...mapState('TimelineSpace/SideMenu', {
      bookmarkSupported: state => state.enabledTimelines.bookmark
    }),
    shortcutEnabled: function () {
      return this.focused && !this.overlaid && !this.openEmojiPicker
    },
    timestamp: function () {
      return this.parseDatetime(this.originalMessage.created_at, this.now)
    },
    readableTimestamp: function () {
      moment.locale(this.language)
      return moment(this.originalMessage.created_at).format('LLLL')
    },
    originalMessage: function () {
      if (this.message.reblog && !this.message.quote) {
        return this.message.reblog
      } else {
        return this.message
      }
    },
    mediaAttachments: function () {
      return this.originalMessage.media_attachments
    },
    reblogsCount: function () {
      if (this.originalMessage.reblogs_count > 0) {
        return this.originalMessage.reblogs_count
      }
      return ''
    },
    favouritesCount: function () {
      if (this.originalMessage.favourites_count > 0) {
        return this.originalMessage.favourites_count
      }
      return ''
    },
    isMyMessage: function () {
      return this.$store.state.TimelineSpace.account.accountId === this.originalMessage.account.id
    },
    application: function () {
      const msg = this.originalMessage
      if (msg.application !== undefined && msg.application !== null) {
        return msg.application.name
      }
      return null
    },
    spoilered: function () {
      return this.originalMessage.spoiler_text.length > 0
    },
    isShowContent: function () {
      return !this.spoilered || this.showContent
    },
    poll: function () {
      return this.originalMessage.poll
    },
    sensitive: function () {
      return (this.hideAllAttachments || this.originalMessage.sensitive) && this.mediaAttachments.length > 0
    },
    isShowAttachments: function () {
      return !this.sensitive || this.showAttachments
    },
    filtered: function () {
      return Filtered(this.originalMessage.content, this.filters)
    },
    locked: function () {
      return this.message.visibility === 'private'
    },
    directed: function () {
      return this.message.visibility === 'direct'
    },
    quoteSupported: function () {
      return QuoteSupported(this.sns, this.account.domain)
    }
  },
  mounted() {
    if (this.focused) {
      this.$refs.status.focus()
    }
    this.updateInterval = setInterval(() => {
      this.$data.now = Date.now()
    }, 60000)
  },
  beforeDestroy() {
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
    username(account) {
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
    accountName(account) {
      switch (this.displayNameStyle) {
        case DisplayStyle.DisplayNameAndUsername.value:
          return `@${account.acct}`
        case DisplayStyle.DisplayName.value:
        case DisplayStyle.Username.value:
          return ''
      }
    },
    parseDatetime(datetime, epoch) {
      switch (this.timeFormat) {
        case TimeFormat.Absolute.value:
          return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        case TimeFormat.Relative.value:
          moment.locale(this.language)
          return moment(datetime).from(epoch)
      }
    },
    tootClick(e) {
      const parsedTag = findTag(e.target, 'toot')
      if (parsedTag !== null) {
        const tag = `/${this.$route.params.id}/hashtag/${parsedTag}`
        this.$router.push({ path: tag })
        return tag
      }
      const parsedAccount = findAccount(e.target, 'toot')
      if (parsedAccount !== null) {
        this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
        this.$store
          .dispatch('TimelineSpace/Contents/SideBar/AccountProfile/searchAccount', {
            parsedAccount: parsedAccount,
            status: this.originalMessage
          })
          .then(account => {
            this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
            this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
          })
          .catch(err => {
            console.error(err)
            this.openLink(e)
            this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', false)
          })
        return parsedAccount.acct
      }
      this.openLink(e)
    },
    openLink(e) {
      const link = findLink(e.target, 'toot')
      if (link !== null) {
        return window.shell.openExternal(link)
      }
    },
    openReply() {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openReply', this.originalMessage)
    },
    openDetail(message) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openTootComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/changeToot', message)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
      this.$refs.status_menu_popper.doClose()
    },
    openBrowser(message) {
      window.shell.openExternal(message.url)
      this.$refs.status_menu_popper.doClose()
    },
    copyLink(message) {
      window.clipboard.writeText(message.url, 'toot-link')
      this.$refs.status_menu_popper.doClose()
    },
    reportUser() {
      this.$store.dispatch('TimelineSpace/Modals/Report/openReport', this.originalMessage)
      this.$refs.status_menu_popper.doClose()
    },
    confirmMute() {
      this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/changeAccount', this.originalMessage.account)
      this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/changeModal', true)
      this.$refs.status_menu_popper.doClose()
    },
    block() {
      this.$store.dispatch('organisms/Toot/block', this.originalMessage.account)
      this.$refs.status_menu_popper.doClose()
    },
    changeReblog(message) {
      if (message.reblogged) {
        this.$store
          .dispatch('organisms/Toot/unreblog', message)
          .then(data => {
            this.$emit('update', data)
          })
          .catch(err => {
            console.error(err)
            this.$message({
              message: this.$t('message.unreblog_error'),
              type: 'error'
            })
          })
      } else {
        this.$store
          .dispatch('organisms/Toot/reblog', message)
          .then(data => {
            this.$emit('update', data)
          })
          .catch(err => {
            console.error(err)
            this.$message({
              message: this.$t('message.reblog_error'),
              type: 'error'
            })
          })
      }
    },
    changeFavourite(message) {
      if (message.favourited) {
        this.$store
          .dispatch('organisms/Toot/removeFavourite', message)
          .then(data => {
            this.$emit('update', data)
          })
          .catch(err => {
            console.error(err)
            this.$message({
              message: this.$t('message.unfavourite_error'),
              type: 'error'
            })
          })
      } else {
        this.$store
          .dispatch('organisms/Toot/addFavourite', message)
          .then(data => {
            this.$emit('update', data)
          })
          .catch(err => {
            console.error(err)
            this.$message({
              message: this.$t('message.favourite_error'),
              type: 'error'
            })
          })
      }
    },
    changeBookmark(message) {
      if (message.bookmarked) {
        this.$store
          .dispatch('organisms/Toot/removeBookmark', message)
          .then(data => {
            this.$emit('update', data)
          })
          .catch(err => {
            console.error(err)
            this.$message({
              message: this.$t('message.unbookmark_error'),
              type: 'error'
            })
          })
      } else {
        this.$store
          .dispatch('organisms/Toot/addBookmark', message)
          .then(data => {
            this.$emit('update', data)
          })
          .catch(err => {
            console.error(err)
            this.$message({
              message: this.$t('message.bookmark_error'),
              type: 'error'
            })
          })
      }
    },
    openImage(url, rawMediaList) {
      const mediaList = rawMediaList.map(media => {
        return media.url
      })
      const currentIndex = mediaList.indexOf(url)
      this.$store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
        currentIndex: currentIndex,
        mediaList: rawMediaList
      })
    },
    openUser(account) {
      console.log(account)
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    deleteToot(message) {
      this.$store
        .dispatch('organisms/Toot/deleteToot', message)
        .then(message => {
          this.$emit('delete', message)
        })
        .catch(() => {
          this.$message({
            message: this.$t('message.delete_error'),
            type: 'error'
          })
        })
    },
    emojiText(content, emojis) {
      return emojify(content, emojis)
    },
    handleTootControl(event) {
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
          this.openReply()
          break
        case 'boost':
          this.changeReblog(this.originalMessage)
          break
        case 'fav':
          this.changeFavourite(this.originalMessage)
          break
        case 'open':
          this.openDetail(this.message)
          break
        case 'profile':
          this.openUser(this.originalMessage.account)
          break
        case 'image': {
          const images = this.mediaAttachments
          if (images.length === 0) {
            return 0
          }
          this.openImage(images[0].url, images)
          break
        }
        case 'cw':
          this.showContent = !this.showContent
          this.showAttachments = !this.showAttachments
          break
      }
    },
    async vote(choices) {
      const res = await this.$store.dispatch('organisms/Toot/vote', {
        id: this.poll.id,
        choices: choices
      })
      const status = Object.assign({}, this.originalMessage, {
        poll: res
      })
      this.$emit('update', status)
    },
    async refresh(id) {
      const res = await this.$store.dispatch('organisms/Toot/refresh', id)
      const status = Object.assign({}, this.originalMessage, {
        poll: res
      })
      this.$emit('update', status)
    },
    async selectEmoji(emoji) {
      const status = await this.$store.dispatch('organisms/Toot/sendReaction', {
        status_id: this.originalMessage.id,
        native: emoji.native
      })
      this.$emit('update', status)
      this.$refs.status_emoji_picker.doClose()
    },
    async addReaction(native) {
      const status = await this.$store.dispatch('organisms/Toot/sendReaction', {
        status_id: this.originalMessage.id,
        native: native
      })
      this.$emit('update', status)
    },
    async removeReaction(native) {
      const status = await this.$store.dispatch('organisms/Toot/deleteReaction', {
        status_id: this.originalMessage.id,
        native: native
      })
      this.$emit('update', status)
    },
    openQuote() {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openQuote', this.originalMessage)
    },
    openPicker() {
      this.openEmojiPicker = true
    },
    hidePicker() {
      this.openEmojiPicker = false
    },
    openMenu() {
      this.openToolMenu = true
    },
    hideMenu() {
      this.openToolMenu = false
    }
  }
}
</script>

<style lang="scss" scoped>
.status {
  background-color: var(--theme-background-color);
}

.toot {
  padding: 8px 0 0 16px;
  position: relative;

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

    .content-wrapper /deep/ {
      font-size: var(--base-font-size);
      color: var(--theme-primary-color);

      blockquote {
        padding-left: 10px;
        border-left: 3px solid #9baec8;
        color: #9baec8;
        margin: 0;
      }

      .content {
        margin: var(--toot-padding) 0;
        word-wrap: break-word;

        pre {
          white-space: pre-wrap;
        }
      }

      .content p {
        unicode-bidi: plaintext;
      }

      .emojione {
        width: 20px;
        height: 20px;
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
        cursor: pointer;
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

    .emoji-reactions {
      .reaction {
        padding: 10px 8px;
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

      .bookmark {
        margin: 0 0 0 8px;
      }

      .bookmarked {
        margin: 0 0 0 8px;
        color: #ff5050;
      }

      .pinned {
        color: gold;
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

  .emoji-picker {
    position: absolute;
    margin-top: 4px;
    z-index: 10;
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

<style lang="scss">
.status-menu-popper {
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

.status-emoji-picker {
  padding: 0;
  border: none;
}
</style>
