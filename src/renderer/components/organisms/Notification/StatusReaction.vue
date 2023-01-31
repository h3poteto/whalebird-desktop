<template>
  <div ref="notificationRef" class="status" tabIndex="0" role="article" :aria-label="reactionType" @click="$emit('select')">
    <div v-show="filtered" class="filtered">Filtered</div>
    <div v-show="!filtered" class="status-reaction">
      <div class="action">
        <div :class="`action-mark ${reactionClass}`">
          <template v-if="reactionIcon === 'unknown'">
            {{ message.emoji }}
          </template>
          <template v-else>
            <font-awesome-icon :icon="reactionIcon" size="sm" />
          </template>
        </div>
        <div class="action-detail">
          <span class="bold" @click="openUser(message.account)">
            <bdi
              v-html="
                $t(reactionMessage, {
                  username: username(message.account),
                  interpolation: { escapeValue: false }
                })
              "
            ></bdi>
          </span>
        </div>
        <div class="action-icon" role="presentation">
          <FailoverImg :src="message.account.avatar" :alt="`Avatar of ${message.account.username}`" />
        </div>
      </div>
      <div class="clearfix"></div>
      <div class="target" v-on:dblclick="openDetail(status)">
        <div class="icon" @click="openUser(status.account)">
          <FailoverImg :src="status.account.avatar" :alt="`Avatar of ${status.account.username}`" role="presentation" />
        </div>
        <div class="detail">
          <div class="toot-header">
            <div class="user" @click="openUser(status.account)">
              <span class="display-name"><bdi v-html="username(status.account)"></bdi></span>
            </div>
            <div class="timestamp">
              <time :datetime="message.created_at" :title="readableTimestamp">
                {{ timestamp }}
              </time>
            </div>
            <div class="clearfix"></div>
          </div>
          <div class="content-wrapper">
            <div class="spoiler" v-show="spoilered">
              <span v-html="spoilerText"></span>
              <el-button v-if="!isShowContent" plain type="primary" size="default" class="spoil-button" @click="showContent = true">
                {{ $t('cards.toot.show_more') }}
              </el-button>
              <el-button v-else plain type="primary" size="default" class="spoil-button" @click="showContent = false">
                {{ $t('cards.toot.hide') }}
              </el-button>
            </div>
            <div class="content" v-show="isShowContent" v-html="statusText" @click.capture.prevent="tootClick"></div>
          </div>
          <div class="attachments">
            <el-button v-show="sensitive && !isShowAttachments" class="show-sensitive" type="info" @click="showAttachments = true">
              {{ $t('cards.toot.sensitive') }}
            </el-button>
            <div v-show="isShowAttachments">
              <el-button
                v-show="sensitive && isShowAttachments"
                class="hide-sensitive"
                link
                @click="showAttachments = false"
                :title="$t('cards.toot.hide')"
              >
                <font-awesome-icon icon="eye" class="hide" />
              </el-button>
              <div class="media" v-bind:key="media.preview_url" v-for="media in mediaAttachments">
                <FailoverImg :srzc="media.preview_url" :title="media.description" :readExif="true" />
                <el-tag class="media-label" size="small" v-if="media.type == 'gifv'">GIF</el-tag>
                <el-tag class="media-label" size="small" v-else-if="media.type == 'video'">VIDEO</el-tag>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>
          <LinkPreview
            v-if="status.card && status.card.type === 'link'"
            :icon="status.card.image"
            :title="status.card.title"
            :description="status.card.description"
            :url="status.card.url"
          />
        </div>
      </div>
      <div class="clearfix"></div>
    </div>
    <div class="fill-line"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, toRefs, ref, PropType, watch, nextTick } from 'vue'
import { Entity } from 'megalodon'
import moment from 'moment'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store'
import { findLink, findTag } from '~/src/renderer/utils/tootParser'
import emojify from '~/src/renderer/utils/emojify'
import FailoverImg from '@/components/atoms/FailoverImg.vue'
import LinkPreview from '@/components/molecules/Toot/LinkPreview.vue'
import Filtered from '@/utils/filter'
import { parseDatetime } from '@/utils/datetime'
import { usernameWithStyle } from '@/utils/username'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'status-reaction',
  components: {
    FailoverImg,
    LinkPreview
  },
  props: {
    message: {
      type: Object as PropType<Entity.Notification>,
      default: {}
    },
    filters: {
      type: Array as PropType<Array<Entity.Filter>>,
      default: []
    },
    reactionType: {
      type: String,
      required: true
    },
    focused: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select'],
  setup(props) {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const win = (window as any) as MyWindow
    const { focused, message, filters, reactionType } = toRefs(props)

    const showContent = ref<boolean>(false)
    const showAttachments = ref<boolean>(false)
    const notificationRef = ref<any>(null)

    const displayNameStyle = computed(() => store.state.App.displayNameStyle)
    const timeFormat = computed(() => store.state.App.timeFormat)
    const language = computed(() => store.state.App.language)
    const hideAllAttachments = computed(() => store.state.App.hideAllAttachments)
    const timestamp = computed(() => parseDatetime(message.value.created_at, timeFormat.value, language.value))
    const readableTimestamp = computed(() => {
      moment.locale(language.value)
      return moment(message.value.created_at).format('LLLL')
    })
    const status = computed(() => message.value.status!)
    const spoilered = computed(() => status.value.spoiler_text.length > 0)
    const isShowContent = computed(() => !spoilered.value || showContent.value)
    const filtered = computed(() => {
      if (!message.value.status) {
        return false
      }
      return Filtered(message.value.status.content, filters.value)
    })
    const mediaAttachments = computed(() => status.value.media_attachments)
    const sensitive = computed(() => (hideAllAttachments.value || status.value.sensitive) && mediaAttachments.value.length > 0)
    const isShowAttachments = computed(() => !sensitive.value || showAttachments.value)
    const statusText = computed(() => emojify(status.value.content, status.value.emojis))
    const spoilerText = computed(() => emojify(status.value.spoiler_text, status.value.emojis))
    const reactionMessage = computed(() => {
      switch (reactionType.value) {
        case 'favourite':
          return 'notification.favourite.body'
        case 'poll-expired':
          return 'notification.poll_expired.body'
        case 'poll-vote':
          return 'notification.poll_vote.body'
        case 'quote':
          return 'notification.quote.body'
        case 'emoji-reaction':
          return 'notification.reaction.body'
        case 'reblog':
          return 'notification.reblog.body'
        default:
          return 'unknown'
      }
    })
    const reactionClass = computed(() => `action-${reactionType.value}`)
    const reactionIcon = computed(() => {
      switch (reactionType.value) {
        case 'favourite':
          return 'star'
        case 'poll-expired':
        case 'poll-vote':
          return 'square-poll-horizontal'
        case 'quote':
        case 'reblog':
          return 'retweet'
        default:
          return 'unknown'
      }
    })

    watch(focused, (newVal, oldVal) => {
      if (newVal) {
        nextTick(() => {
          notificationRef.value.focus()
        })
      } else if (oldVal && !newVal) {
        nextTick(() => {
          notificationRef.value.blur()
        })
      }
    })

    const username = (account: Entity.Account) => usernameWithStyle(account, displayNameStyle.value)
    const tootClick = (e: MouseEvent) => {
      const parsedTag = findTag(e.target as HTMLElement, 'toot')
      if (parsedTag !== null) {
        const tag = `/${route.params.id}/hashtag/${parsedTag}`
        router.push({ path: tag })
        return tag
      }
      return openLink(e)
    }

    const openLink = (e: MouseEvent) => {
      const link = findLink(e.target as HTMLElement, 'status-reaction')
      if (link !== null) {
        win.ipcRenderer.invoke('open-browser', link)
      }
    }
    const openUser = (account: Entity.Account) => {
      router.push({ query: { detail: 'true', account_id: account.id } })
    }
    const openDetail = (status: Entity.Status) => {
      router.push({ query: { detail: 'true', status_id: status.id } })
    }

    return {
      showContent,
      showAttachments,
      notificationRef,
      displayNameStyle,
      timeFormat,
      language,
      hideAllAttachments,
      timestamp,
      readableTimestamp,
      username,
      tootClick,
      openUser,
      openDetail,
      mediaAttachments,
      filtered,
      spoilered,
      isShowContent,
      sensitive,
      isShowAttachments,
      status,
      statusText,
      spoilerText,
      reactionMessage,
      reactionClass,
      reactionIcon
    }
  }
})
</script>

<style lang="scss" scoped>
.bold {
  font-weight: bold;
}

.status-reaction {
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
      float: left;
      width: 32px;
      text-align: right;
    }

    .action-favourite {
      color: #e6a23c;
    }

    .action-poll-expired {
      color: #409eff;
    }

    .action-poll-vote {
      color: #67c23a;
    }

    .action-quote {
      color: #409eff;
    }

    .action-reaction {
      color: #e6a23c;
    }

    .action-reblog {
      color: #409eff;
    }

    .action-detail {
      margin-left: 10px;
      font-size: var(--base-font-size);
      float: left;
      max-width: 80%;

      .bold {
        cursor: pointer;
      }

      .bold :deep(.emojione) {
        max-width: 14px;
        max-height: 14px;
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

      .content-wrapper {
        font-size: var(--base-font-size);
        margin: 0;

        .content {
          font-size: var(--base-font-size);
          word-wrap: break-word;
        }

        .content p {
          unicode-bidi: plaintext;
        }
      }

      .content-wrapper :deep(.emojione) {
        width: 20px;
        height: 20px;
      }

      .toot-header {
        height: 22px;

        .user {
          float: left;
          font-size: var(--base-font-size);
          cursor: pointer;

          .display-name :deep(.emojione) {
            max-width: 14px;
            max-height: 14px;
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

.status {
  padding-bottom: 4px;
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
