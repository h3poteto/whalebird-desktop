<template>
  <div
    class="status"
    tabIndex="0"
    v-shortkey="shortcutEnabled ? { next: ['j'], prev: ['k'], right: ['l'], left: ['h'], open: ['o'], profile: ['p'] } : {}"
    @shortkey="handleStatusControl"
    ref="status"
    @click="$emit('select')"
    role="article"
    aria-label="favourited toot"
  >
    <div v-show="filtered(message)" class="filtered">
      Filtered
    </div>
    <div v-show="!filtered(message)" class="favourite">
      <div class="action">
        <div class="action-mark">
          <icon name="star" scale="0.7"></icon>
        </div>
        <div class="action-detail">
          <span class="bold" @click="openUser(message.account)"><bdi v-html="username(message.account)"></bdi></span> favourited your status
        </div>
        <div class="action-icon" role="presentation">
          <FailoverImg :src="message.account.avatar" :alt="`Avatar of ${message.account.username}`" />
        </div>
      </div>
      <div class="clearfix"></div>
      <div class="target" v-on:dblclick="openDetail(message.status)">
        <div class="icon" @click="openUser(message.status.account)">
          <FailoverImg :src="message.status.account.avatar" :alt="`Avatar of ${message.status.account.username}`" role="presentation" />
        </div>
        <div class="detail">
          <div class="toot-header">
            <div class="user" @click="openUser(message.status.account)">
              <span class="display-name"><bdi v-html="username(message.status.account)"></bdi></span>
            </div>
            <div class="timestamp">
              {{ parseDatetime(message.status.created_at) }}
            </div>
            <div class="clearfix"></div>
          </div>
          <div class="content-wrapper">
            <div class="spoiler" v-show="spoilered(message.status)">
              <span v-html="spoilerText(message.status)"></span>
              <el-button
                v-if="!isShowContent(message.status)"
                plain
                type="primary"
                size="medium"
                class="spoil-button"
                @click="showContent = true"
              >
                {{ $t('cards.toot.show_more') }}
              </el-button>
              <el-button v-else plain type="primary" size="medium" class="spoil-button" @click="showContent = false">
                {{ $t('cards.toot.hide') }}
              </el-button>
            </div>
            <div
              class="content"
              v-show="isShowContent(message.status)"
              v-html="status(message.status)"
              @click.capture.prevent="tootClick"
            ></div>
          </div>
          <div class="attachments">
            <el-button
              v-show="sensitive(message.status) && !isShowAttachments(message.status)"
              class="show-sensitive"
              type="info"
              @click="showAttachments = true"
            >
              {{ $t('cards.toot.sensitive') }}
            </el-button>
            <div v-show="isShowAttachments(message.status)">
              <el-button
                v-show="sensitive(message.status) && isShowAttachments(message.status)"
                class="hide-sensitive"
                type="text"
                @click="showAttachments = false"
                :title="$t('cards.toot.hide')"
              >
                <icon name="eye" class="hide"></icon>
              </el-button>
              <div class="media" v-bind:key="media.preview_url" v-for="media in mediaAttachments(message.status)">
                <FailoverImg :src="media.preview_url" :title="media.description" :readExif="true" />
                <el-tag class="media-label" size="mini" v-if="media.type == 'gifv'">GIF</el-tag>
                <el-tag class="media-label" size="mini" v-else-if="media.type == 'video'">VIDEO</el-tag>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>
        </div>
      </div>
      <div class="clearfix"></div>
    </div>
    <div class="fill-line"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import { findAccount, findLink, findTag } from '~/src/renderer/utils/tootParser'
import emojify from '~/src/renderer/utils/emojify'
import TimeFormat from '~/src/constants/timeFormat'
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'

export default {
  name: 'favourite',
  components: {
    FailoverImg
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
    }
  },
  data() {
    return {
      showContent: false,
      showAttachments: false
    }
  },
  computed: {
    ...mapState({
      displayNameStyle: state => state.App.displayNameStyle,
      timeFormat: state => state.App.timeFormat,
      language: state => state.App.language
    }),
    shortcutEnabled: function() {
      return this.focused && !this.overlaid
    }
  },
  mounted() {
    if (this.focused) {
      this.$refs.status.focus()
    }
  },
  watch: {
    focused: function(newState, oldState) {
      if (newState) {
        this.$nextTick(function() {
          this.$refs.status.focus()
        })
      } else if (oldState && !newState) {
        this.$nextTick(function() {
          this.$refs.status.blur()
        })
      }
    }
  },
  methods: {
    username(account) {
      if (account.display_name !== '') {
        return emojify(account.display_name, account.emojis)
      } else {
        return account.username
      }
    },
    parseDatetime(datetime) {
      switch (this.timeFormat) {
        case TimeFormat.Absolute.value:
          return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
        case TimeFormat.Relative.value:
          moment.locale(this.language)
          return moment(datetime).fromNow()
      }
    },
    tootClick(e) {
      const parsedTag = findTag(e.target, 'favourite')
      if (parsedTag !== null) {
        const tag = `/${this.$route.params.id}/hashtag/${parsedTag}`
        this.$router.push({ path: tag })
        return tag
      }
      const parsedAccount = findAccount(e.target, 'favourite')
      if (parsedAccount !== null) {
        this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
        this.$store
          .dispatch('TimelineSpace/Contents/SideBar/AccountProfile/searchAccount', parsedAccount)
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
      const link = findLink(e.target, 'favourite')
      if (link !== null) {
        return window.shell.openExternal(link)
      }
    },
    openUser(account) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openAccountComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/changeAccount', account)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    openDetail(message) {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/openTootComponent')
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/changeToot', message)
      this.$store.commit('TimelineSpace/Contents/SideBar/changeOpenSideBar', true)
    },
    mediaAttachments(message) {
      return message.media_attachments
    },
    filtered(message) {
      return this.filter.length > 0 && message.status.content.search(this.filter) >= 0
    },
    spoilered(message) {
      return message.spoiler_text.length > 0
    },
    isShowContent(message) {
      return !this.spoilered(message) || this.showContent
    },
    sensitive(message) {
      return message.sensitive && this.mediaAttachments(message).length > 0
    },
    isShowAttachments(message) {
      return !this.sensitive(message) || this.showAttachments
    },
    status(message) {
      return emojify(message.content, message.emojis)
    },
    spoilerText(message) {
      return emojify(message.spoiler_text, message.emojis)
    },
    handleStatusControl(event) {
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
        case 'open':
          this.openDetail(this.message.status)
          break
        case 'profile':
          this.openUser(this.message.account)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bold {
  font-weight: bold;
}

.favourite {
  padding: 8px 0 0 16px;

  .fa-icon {
    font-size: 0.9em;
    width: auto;
    height: 1em;
    max-width: 100%;
    max-height: 100%;
  }

  .action {
    margin-right: 8px;

    .action-mark {
      color: #e6a23c;
      float: left;
      width: 32px;
      text-align: right;
    }

    .action-detail {
      margin-left: 10px;
      font-size: var(--base-font-size);
      float: left;
      max-width: 80%;

      .bold /deep/ {
        cursor: pointer;

        .emojione {
          max-width: 14px;
          max-height: 14px;
        }
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
      cursor: pointer;

      img {
        width: 32px;
        height: 32px;
        border-radius: 4px;
      }
    }

    .detail {
      margin: 8px 8px 0 42px;
      color: #909399;

      .content-wrapper /deep/ {
        font-size: var(--base-font-size);
        margin: 0;

        .content {
          font-size: var(--base-font-size);
          word-wrap: break-word;
        }

        .emojione {
          width: 20px;
          height: 20px;
        }
      }

      .toot-header {
        height: 22px;

        .user {
          float: left;
          font-size: var(--base-font-size);
          cursor: pointer;

          .display-name /deep/ {
            .emojione {
              max-width: 14px;
              max-height: 14px;
            }
          }
        }

        .timestamp {
          font-size: var(--base-font-size);
          text-align: right;
          width: 100%;
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
            background: rgba(0, 0, 0, 0.5);
          }
        }
      }
    }
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
