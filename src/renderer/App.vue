<template>
  <div id="app" :style="theme">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Whalebird',
  computed: {
    ...mapState({
      theme: (state) => {
        return {
          '--theme-background-color': state.App.theme.background_color,
          '--theme-primary-color': state.App.theme.primary_color
        }
      }
    })
  },
  created () {
    this.$store.dispatch('App/watchShortcutsEvents')
    this.$store.dispatch('App/loadPreferences')
  },
  destroyed () {
    this.$store.dispatch('App/removeShortcutsEvents')
  }
}
</script>

<style lang="scss">
body { font-family: 'Noto Sans', sans-serif; }

html, body, #app {
  --theme-background-color: #ffffff;
  --theme-primary-color: #303133;
  background-color: var(--theme-background-color);
  color: var(--theme-primary-color);

  a:link,
  a:visited,
  a:hover,
  a:active,
  a:focus {
    color: #409eff;
  }
}

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
