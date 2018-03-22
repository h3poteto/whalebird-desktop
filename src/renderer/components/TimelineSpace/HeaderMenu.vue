<template>
<div id="header_menu">
  <div class="channel">#{{ channelName() }}</div>
</div>
</template>

<script>
export default {
  name: 'header-menu',
  methods: {
    channelName () {
      switch (this.$route.name) {
        case 'home':
          return 'Home'
        case 'notifications':
          return 'Notification'
        case 'favourites':
          return 'Favourite'
        case 'local':
          return 'LocalTimeline'
        case 'public':
          return 'PublicTimeline'
        default:
          return 'Home'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#header_menu {
  .channel {
    padding: 12px 24px;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>
