<template>
  <nav id="header_menu" :aria-label="title">
    <div class="channel">
      <h1>{{ title }}</h1>
    </div>
    <div class="tools">
      <img src="../../assets/images/loading-spinner-wide.svg" v-show="loading" class="header-loading" />
      <el-button
        v-if="streamingSwitchable()"
        type="text"
        class="action"
        @click="switchStreaming"
        :title="$t('header_menu.switch_streaming')"
      >
        <svg
          :class="useWebsocket ? 'websocket' : 'not-websocket'"
          width="25"
          height="18"
          viewBox="0 0 256 193"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
        >
          <path
            d="M192.44 144.645h31.78V68.339l-35.805-35.804-22.472 22.472 26.497 26.497v63.14zm31.864 15.931H113.452L86.954 134.08l11.237-11.236 21.885 21.885h45.028l-44.357-44.441 11.32-11.32 44.357 44.358V88.296l-21.801-21.801 11.152-11.153L110.685 0H0l31.696 31.696v.084H97.436l23.227 23.227-33.96 33.96L63.476 65.74V47.712h-31.78v31.193l55.007 55.007L64.314 156.3l35.805 35.805H256l-31.696-31.529z"
          />
        </svg>
      </el-button>
      <el-button type="text" class="action" @click="openNewTootModal" :title="$t('header_menu.new_toot')">
        <icon name="regular/edit" scale="1.1"></icon>
      </el-button>
      <el-button v-show="reloadable()" type="text" class="action" @click="reload" :title="$t('header_menu.reload')">
        <icon name="sync-alt"></icon>
      </el-button>
      <el-popover placement="left-start" width="320" popper-class="theme-popover" trigger="click" v-model="filterVisible">
        <div>
          <el-form role="form" label-position="left" label-width="125px" size="medium">
            <el-form-item for="filter" :label="$t('header_menu.filter.title')">
              <div class="el-input">
                <input
                  id="filter"
                  class="el-input__inner"
                  v-model="filter"
                  :placeholder="$t('header_menu.filter.placeholder')"
                  v-shortkey.avoid
                  :aria-label="$t('header_menu.filter.placeholder')"
                  :title="$t('header_menu.filter.placeholder')"
                />
              </div>
            </el-form-item>
            <el-form-item for="show-reblogs" :label="$t('header_menu.filter.show_reblogs')" v-if="extrasFilterable()">
              <el-checkbox id="show-reblogs" v-model="showReblogs"></el-checkbox>
            </el-form-item>
            <el-form-item for="show-replies" :label="$t('header_menu.filter.show_replies')" v-if="extrasFilterable()">
              <el-checkbox id="show-replies" v-model="showReplies"></el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="applyFilter(filter)">{{ $t('header_menu.filter.apply') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-button v-show="filterable()" slot="reference" type="text" class="action" :title="$t('header_menu.filter.title')">
          <icon name="sliders-h"></icon>
        </el-button>
      </el-popover>
      <el-button type="text" class="action" @click="settings" :title="$t('header_menu.settings')">
        <icon name="cog" scale="1.1"></icon>
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
      filter: '',
      filterVisible: false,
      showReblogs: true,
      showReplies: true
    }
  },
  computed: {
    ...mapState('TimelineSpace/HeaderMenu', {
      title: state => state.title,
      loading: state => state.loading
    }),
    ...mapState('TimelineSpace', {
      useWebsocket: state => state.useWebsocket,
      pleroma: state => state.pleroma
    })
  },
  created() {
    this.channelName()
    this.loadFilter()
    this.$store.dispatch('TimelineSpace/HeaderMenu/setupLoading')
  },
  watch: {
    $route: function() {
      this.channelName()
      this.loadFilter()
    }
  },
  methods: {
    id() {
      return this.$route.params.id
    },
    channelName() {
      switch (this.$route.name) {
        case 'home':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.home'))
          break
        case 'notifications':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.notification'))
          break
        case 'favourites':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.favourite'))
          break
        case 'mentions':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.mention'))
          break
        case 'follow-requests':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.follow_requests'))
          break
        case 'local':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.local'))
          break
        case 'public':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.public'))
          break
        case 'hashtag-list':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.hashtag'))
          break
        case 'tag':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', `#${this.$route.params.tag}`)
          break
        case 'search':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.search'))
          break
        case 'lists':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.lists'))
          break
        case 'direct-messages':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.direct_messages'))
          break
        case 'edit-list':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.members'))
          break
        case 'list':
          this.$store.dispatch('TimelineSpace/HeaderMenu/fetchList', this.$route.params.list_id)
          break
        default:
          console.log(this.$route)
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', this.$t('header_menu.home'))
          break
      }
    },
    streamingSwitchable() {
      switch (this.$route.name) {
        case 'direct-messages':
        case 'local':
        case 'public':
        case 'tag':
        case 'list':
          return !this.pleroma
        default:
          return false
      }
    },
    switchStreaming() {
      this.$store.dispatch('TimelineSpace/stopStreamings')
      this.$store.commit('TimelineSpace/changeUseWebsocket', !this.useWebsocket)
      this.$store.dispatch('TimelineSpace/startStreamings')
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
        case 'local':
        case 'public':
        case 'tag':
        case 'list':
        case 'direct-messages':
          this.$store.commit('TimelineSpace/HeaderMenu/changeReload', true)
          break
        default:
          console.log('Not implemented')
      }
    },
    reloadable() {
      switch (this.$route.name) {
        case 'home':
        case 'notifications':
        case 'mentions':
        case 'favourites':
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
    loadFilter() {
      switch (this.$route.name) {
        case 'home':
          this.filter = this.$store.state.TimelineSpace.Contents.Home.filter
          this.showReblogs = this.$store.state.TimelineSpace.Contents.Home.showReblogs
          this.showReplies = this.$store.state.TimelineSpace.Contents.Home.showReplies
          break
        case 'notifications':
          this.filter = this.$store.state.TimelineSpace.Contents.Notifications.filter
          break
        case 'mentions':
          this.filter = this.$store.state.TimelineSpace.Contents.Mentions.filter
          break
        case 'favourites':
          this.filter = this.$store.state.TimelineSpace.Contents.Favourites.filter
          break
        case 'local':
          this.filter = this.$store.state.TimelineSpace.Contents.Local.filter
          break
        case 'public':
          this.filter = this.$store.state.TimelineSpace.Contents.Public.filter
          break
        case 'tag':
          this.filter = this.$store.state.TimelineSpace.Contents.Hashtag.Tag.filter
          break
        case 'list':
          this.filter = this.$store.state.TimelineSpace.Contents.Lists.Show.filter
          break
        case 'direct-messages':
          this.filter = this.$store.state.TimelineSpace.Contents.DirectMessages.filter
          break
        default:
          console.log('Not implemented')
      }
    },
    applyFilter(filter) {
      switch (this.$route.name) {
        case 'home':
          this.$store.commit('TimelineSpace/Contents/Home/changeFilter', filter)
          this.$store.commit('TimelineSpace/Contents/Home/showReblogs', this.showReblogs)
          this.$store.commit('TimelineSpace/Contents/Home/showReplies', this.showReplies)
          break
        case 'notifications':
          this.$store.commit('TimelineSpace/Contents/Notifications/changeFilter', filter)
          break
        case 'mentions':
          this.$store.commit('TimelineSpace/Contents/Mentions/changeFilter', filter)
          break
        case 'favourites':
          this.$store.commit('TimelineSpace/Contents/Favourites/changeFilter', filter)
          break
        case 'local':
          this.$store.commit('TimelineSpace/Contents/Local/changeFilter', filter)
          break
        case 'public':
          this.$store.commit('TimelineSpace/Contents/Public/changeFilter', filter)
          break
        case 'tag':
          this.$store.commit('TimelineSpace/Contents/Hashtag/Tag/changeFilter', filter)
          break
        case 'list':
          this.$store.commit('TimelineSpace/Contents/Lists/Show/changeFilter', filter)
          break
        case 'direct-messages':
          this.$store.commit('TimelineSpace/Contents/DirectMessages/changeFilter', filter)
          break
        default:
          console.log('Not implemented')
      }
      this.filterVisible = false
    },
    filterable() {
      switch (this.$route.name) {
        case 'home':
        case 'notifications':
        case 'mentions':
        case 'favourites':
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
    extrasFilterable() {
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
    }
  }
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

  .channel {
    margin-right: auto;

    h1 {
      margin: 0;
    }
  }

  .tools {
    font-size: 18px;
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

      .not-websocket {
        fill: var(--theme-secondary-color);

        &:hover {
          fill: #409eff;
        }
      }

      .websocket {
        fill: #409eff;
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
