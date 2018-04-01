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
body { font-family: 'Noto Sans', sans-serif; }

html, body, #app, #global_header {
  height: 100%;
  margin: 0;
}

p {
  margin: 8px 0;
}

.clearfix:after {
  content:" ";
  display:block;
  clear:both;
}
</style>
