<template>
<div
  class="status"
  tabIndex="0"
  ref="status"
  >
  <div class="toot">
    <div class="icon">
      <img :src="sampleIcon" />
    </div>
    <div class="detail">
      <div class="toot-header">
        <div class="user">
          <span class="display-name">{{ username }}</span>
          <span class="acct">{{ accountName }}</span>
        </div>
        <div class="timestamp">
          {{ timestamp }}
        </div>
        <div class="clearfix"></div>
      </div>
      <div class="content-wrapper">
        <div class="content" v-html="status"></div>
      </div>
      <div class="tool-box">
        <el-button type="text" class="reply" :title="$t('cards.toot.reply')">
          <icon name="reply" scale="0.9"></icon>
        </el-button>
        <el-button type="text" class="reblog" :title="$t('cards.toot.reblog')">
          <icon name="retweet" scale="0.9"></icon>
        </el-button>
        <span class="count">
          {{ reblogsCount }}
        </span>
        <el-button type="text" class="favourite" :title="$t('cards.toot.fav')">
          <icon name="star" scale="0.9"></icon>
        </el-button>
        <span class="count">
          {{ favouritesCount }}
        </span>
        <popper trigger="click" :options="{placement: 'bottom'}" ref="popper">
          <div class="popper toot-menu">
            <ul class="menu-list">
              <li role="button">
                {{ $t('cards.toot.view_toot_detail') }}
              </li>
              <li role="button">
                {{ $t('cards.toot.open_in_browser') }}
              </li>
              <li role="button">
                {{ $t('cards.toot.copy_link_to_toot') }}
              </li>
              <li role="button" class="separate">
                {{ $t('cards.toot.delete') }}
              </li>
            </ul>
          </div>
          <el-button slot="reference" type="text" :title="$t('cards.toot.detail')">
            <icon name="ellipsis-h" scale="0.9"></icon>
          </el-button>
        </popper>
      </div>
      <div class="application">
        {{ $t('cards.toot.via', { application: 'Whalebird' }) }}
      </div>
    </div>
    <div class="clearfix"></div>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import DisplayStyle from '~/src/constants/displayStyle'
import TimeFormat from '~/src/constants/timeFormat'

export default {
  name: 'toot',
  props: {
    displayNameStyle: {
      type: Number,
      default: DisplayStyle.DisplayNameAndUsername.value
    },
    timeFormat: {
      type: Number,
      default: TimeFormat.Absolute.value
    }
  },
  computed: {
    sampleIcon () {
      return 'https://github.com/h3poteto/whalebird-desktop/raw/master/build/icons/256x256.png'
    },
    username () {
      switch (this.displayNameStyle) {
        case DisplayStyle.DisplayNameAndUsername.value:
        case DisplayStyle.DisplayName.value:
          return 'Roma'
        default:
          return 'Roma@mastodon.social'
      }
    },
    accountName () {
      switch (this.displayNameStyle) {
        case DisplayStyle.DisplayNameAndUsername.value:
          return 'Roma@mastodon.social'
        default:
          return ''
      }
    },
    timestamp () {
      switch (this.timeFormat) {
        case TimeFormat.Absolute.value:
          return '2018-08-12 20:35:41'
        case TimeFormat.Relative.value:
          return moment('2018-08-12 20:35:41').fromNow()
      }
    },
    status () {
      return '<p>Sample status</p>'
    },
    reblogsCount () {
      return 1
    },
    favouritesCount () {
      return 5
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

    .tool-box {
      float: left;

      button {
        margin: 0 8px;
        padding: 0;
        color: #909399;
      }

      .count {
        font-size: 0.8em;
        color: #909399;
        margin: 0 0 4px -8px;
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

.status {
  background-color: var(--theme-background-color);
  border: 1px solid var(--theme-border-color);
  border-radius: 4px;
  padding-bottom: 4px;
  box-shadow: 0 0 12px var(--theme-border-color);
}

.status:focus {
  background-color: var(--theme-selected-background-color);
  outline: 0;
}

</style>
