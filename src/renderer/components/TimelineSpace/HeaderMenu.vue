<template>
<div id="header_menu">
  <div class="channel">{{ title }}</div>
  <div class="tools">
    <el-button type="text" class="action" @click="openNewTootModal" :title="$t('header_menu.new_toot')">
      <icon name="regular/edit" scale="1.1"></icon>
    </el-button>
    <el-button v-show="reloadable()" type="text" class="action" @click="reload" :title="$t('header_menu.reload')">
      <icon name="sync-alt"></icon>
    </el-button>
    <el-popover
      placement="left-start"
      width="320"
      popper-class="theme-popover"
      trigger="click"
      v-model="filterVisible">
      <div>
        <el-form role="form">
          <el-form-item :label="$t('header_menu.filter.title')">
            <div class="input-wrapper">
              <input
                v-model="filter"
                :placeholder="$t('header_menu.filter.placeholder')"
                v-shortkey.avoid
                aria-label="filter words"
                tilte="filter"
                ></input>
            </div>
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
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'header-menu',
  data () {
    return {
      filter: '',
      filterVisible: false
    }
  },
  computed: {
    ...mapState({
      title: state => state.TimelineSpace.HeaderMenu.title
    })
  },
  created () {
    this.channelName()
    this.loadFilter()
  },
  watch: {
    '$route': function () {
      this.channelName()
      this.loadFilter()
    }
  },
  methods: {
    channelName () {
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
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Direct Messages')
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
    openNewTootModal () {
      this.$store.dispatch('TimelineSpace/Modals/NewToot/openModal')
    },
    reload () {
      switch (this.$route.name) {
        case 'home':
        case 'notifications':
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
    reloadable () {
      switch (this.$route.name) {
        case 'home':
        case 'notifications':
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
    loadFilter () {
      switch (this.$route.name) {
        case 'home':
          this.filter = this.$store.state.TimelineSpace.Contents.Home.filter
          break
        case 'notifications':
          this.filter = this.$store.state.TimelineSpace.Contents.Notifications.filter
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
    applyFilter (filter) {
      switch (this.$route.name) {
        case 'home':
          this.$store.commit('TimelineSpace/Contents/Home/changeFilter', filter)
          break
        case 'notifications':
          this.$store.commit('TimelineSpace/Contents/Notifications/changeFilter', filter)
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
    filterable () {
      switch (this.$route.name) {
        case 'home':
        case 'notifications':
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
    }
  }
}
</script>

<style lang="scss" scoped>
#header_menu {
  background-color: var(--theme-background-color);
  padding: 12px 24px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: stretch;

  .channel {
    font-weight: bold;
    font-size: 18px;
    margin-right: auto;
  }

  .tools {
    font-size: 18px;

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
  width: 100%;

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
