<template>
<div id="header_menu">
  <div class="channel">{{ title }}</div>
  <div class="tools">
    <el-button type="text" class="action" @click="openNewTootModal">
      <icon name="regular/edit"></icon>
    </el-button>
    <el-button type="text" class="action" @click="reload">
      <icon name="sync-alt"></icon>
    </el-button>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'header-menu',
  computed: {
    ...mapState({
      title: state => state.TimelineSpace.HeaderMenu.title
    })
  },
  created () {
    this.channelName()
  },
  watch: {
    '$route': function () {
      this.channelName()
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
      switch (this.title) {
        case 'Home':
        case 'Notification':
        case 'Favourite':
        case 'Local timeline':
        case 'Public timeline':
        case 'Hashtag':
        case `#${this.$route.params.tag}`:
        case 'Lists':
          this.$store.commit('TimelineSpace/HeaderMenu/changeReload', true)
          break
        default:
          console.log('Not impletemented')
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

      &:hover {
        color: #409eff;
      }
    }
  }
}
</style>
