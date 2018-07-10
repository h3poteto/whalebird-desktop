<template>
<div id="header_menu">
  <div class="channel">{{ title }}</div>
  <div class="tools">
    <el-button type="text" class="action" @click="openNewTootModal">
      <icon name="regular/edit"></icon>
    </el-button>
    <el-button v-show="reloadable()" type="text" class="action" @click="reload">
      <icon name="sync-alt"></icon>
    </el-button>
    <el-popover
      placement="left-start"
      width="320"
      popper-class="theme-popover"
      trigger="click"
      v-model="filterVisible">
      <div>
        <el-form>
          <el-form-item label="Filter">
            <el-input v-model="filter" placeholder="Filter out by regular expressions"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="applyFilter(filter)">Apply</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-button v-show="filterable()" slot="reference" type="text" class="action">
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
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Home')
          break
        case 'notifications':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Notification')
          break
        case 'favourites':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Favourite')
          break
        case 'local':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Local timeline')
          break
        case 'public':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Public timeline')
          break
        case 'hashtag-list':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Hashtag')
          break
        case 'tag':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', `#${this.$route.params.tag}`)
          break
        case 'search':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Search')
          break
        case 'lists':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Lists')
          break
        case 'edit-list':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Members')
          break
        case 'list':
          this.$store.dispatch('TimelineSpace/HeaderMenu/fetchList', this.$route.params.list_id)
          break
        default:
          console.log(this.$route)
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Home')
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
</style>
