<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'Whalebird',
    created () {
      this.$store.dispatch('App/watchShortcutsEvents')
    },
    destroyed () {
      this.$store.dispatch('App/removeShortcutsEvents')
    }
  }
</script>

<style lang="scss">
.clearfix:after {
  content:" ";
  display:block;
  clear:both;
}
</style>
