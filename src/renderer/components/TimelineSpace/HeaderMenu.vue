<template>
  <nav id="header_menu" :aria-label="title">
    <div class="channel">
      <h1>{{ title }}</h1>
    </div>
    <div class="tools">
      <img
        src="../../assets/images/loading-spinner-wide.svg"
        v-show="loading"
        class="header-loading"
      />
      <el-button
        type="text"
        class="action"
        @click="openNewTootModal"
        :title="$t('header_menu.new_toot')"
      >
        <font-awesome-icon :icon="['far', 'pen-to-square']" />
      </el-button>
      <el-button
        v-show="reloadable()"
        type="text"
        class="action"
        @click="reload"
        :title="$t('header_menu.reload')"
      >
        <font-awesome-icon icon="rotate" />
      </el-button>
      <el-popover
        placement="left-start"
        width="180"
        popper-class="theme-popover"
        trigger="click"
        v-model="TLOptionVisible"
      >
        <div>
          <el-form
            role="form"
            label-position="left"
            label-width="125px"
            size="medium"
          >
            <el-form-item
              for="show-reblogs"
              :label="$t('header_menu.option.show_reblogs')"
            >
              <el-checkbox
                id="show-reblogs"
                v-model="showReblogs"
              ></el-checkbox>
            </el-form-item>
            <el-form-item
              for="show-replies"
              :label="$t('header_menu.option.show_replies')"
            >
              <el-checkbox
                id="show-replies"
                v-model="showReplies"
              ></el-checkbox>
            </el-form-item>
            <el-button type="primary" @click="applyTLOption">{{
              $t('header_menu.option.apply')
            }}</el-button>
          </el-form>
        </div>
        <el-button
          v-show="TLOption()"
          slot="reference"
          type="text"
          class="action"
          :title="$t('header_menu.option.title')"
        >
          <font-awesome-icon icon="sliders" />
        </el-button>
      </el-popover>
      <el-button
        type="text"
        class="action"
        @click="settings"
        :title="$t('header_menu.settings')"
      >
        <font-awesome-icon icon="gear" />
      </el-button>
    </div>
  </nav>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'header-menu',
  data() {
    return {
      TLOptionVisible: false,
      showReblogs: true,
      showReplies: true,
    }
  },
  computed: {
    ...mapState('TimelineSpace/HeaderMenu', {
      title: (state) => state.title,
      loading: (state) => state.loading,
    }),
  },
  created() {
    this.channelName()
    this.loadTLOption()
    this.$store.dispatch('TimelineSpace/HeaderMenu/setupLoading')
  },
  watch: {
    $route: function () {
      this.channelName()
      this.loadTLOption()
    },
  },
  methods: {
    id() {
      return this.$route.params.id
    },
    channelName() {
      switch (this.$route.name) {
        case 'home':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.home')
          )
          break
        case 'notifications':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.notification')
          )
          break
        case 'favourites':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.favourite')
          )
          break
        case 'bookmarks':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.bookmark')
          )
          break
        case 'mentions':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.mention')
          )
          break
        case 'follow-requests':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.follow_requests')
          )
          break
        case 'local':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.local')
          )
          break
        case 'public':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.public')
          )
          break
        case 'hashtag-list':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.hashtag')
          )
          break
        case 'tag':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            `#${this.$route.params.tag}`
          )
          break
        case 'search':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.search')
          )
          break
        case 'lists':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.lists')
          )
          break
        case 'direct-messages':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.direct_messages')
          )
          break
        case 'edit-list':
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.members')
          )
          break
        case 'list':
          this.$store.dispatch(
            'TimelineSpace/HeaderMenu/fetchList',
            this.$route.params.list_id
          )
          break
        default:
          console.log(this.$route)
          this.$store.commit(
            'TimelineSpace/HeaderMenu/updateTitle',
            this.$t('header_menu.home')
          )
          break
      }
    },
    openNewTootModal() {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openModal')
    },
    reload() {
      switch (this.$route.name) {
        case 'home':
        case 'notifications':
        case 'mentions':
        case 'favourites':
        case 'bookmarks':
        case 'local':
        case 'public':
        case 'tag':
        case 'list':
        case 'direct-messages':
          this.$store.commit('TimelineSpace/HeaderMenu/changeReload', true)
          break
        default:
          console.error('Not implemented')
      }
    },
    reloadable() {
      switch (this.$route.name) {
        case 'home':
        case 'notifications':
        case 'mentions':
        case 'favourites':
        case 'bookmarks':
        case 'local':
        case 'public':
        case 'tag':
        case 'list':
        case 'direct-messages':
          return true
        default:
          return false
      }
    },
    loadTLOption() {
      switch (this.$route.name) {
        case 'home':
          this.showReblogs =
            this.$store.state.TimelineSpace.Contents.Home.showReblogs
          this.showReplies =
            this.$store.state.TimelineSpace.Contents.Home.showReplies
          break
        default:
          console.log('Not implemented')
      }
    },
    applyTLOption() {
      switch (this.$route.name) {
        case 'home':
          this.$store.commit(
            'TimelineSpace/Contents/Home/showReblogs',
            this.showReblogs
          )
          this.$store.commit(
            'TimelineSpace/Contents/Home/showReplies',
            this.showReplies
          )
          break
        default:
          console.log('Not implemented')
      }
      this.TLOptionVisible = false
    },
    TLOption() {
      switch (this.$route.name) {
        case 'home':
          return true
        default:
          return false
      }
    },
    settings() {
      const url = `/${this.id()}/settings`
      this.$router.push(url)
    },
  },
}
</script>

<style lang="scss" scoped>
#header_menu {
  background-color: var(--theme-background-color);
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  user-select: none;
  line-height: normal;

  .channel {
    margin-right: auto;

    h1 {
      margin: 0;
    }
  }

  .tools {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .header-loading {
      width: 18px;
    }

    .action {
      color: var(--theme-secondary-color);
      padding: 0;
      margin-left: 8px;

      &:hover {
        color: #409eff;
      }
    }
  }
}

.input-wrapper {
  position: relative;
  font-size: 14px;
  display: inline-block;
  max-width: 100%;

  input {
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: none;
    padding: 0 15px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;

    &:focus {
      outline: none;
      border-color: #409eff;
    }
  }
}
</style>
