<template>
<div id="header_menu">
  <div class="channel">{{ title }}</div>
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
        case 'search':
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Search')
          break
        case 'lists':
          this.$store.dispatch('TimelineSpace/HeaderMenu/fetchList', this.$route.params.list_id)
          break
        default:
          this.$store.commit('TimelineSpace/HeaderMenu/updateTitle', 'Home')
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#header_menu {
  background-color: var(--theme-background-color);

  .channel {
    padding: 12px 24px;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>
