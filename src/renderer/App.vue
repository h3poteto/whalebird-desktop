<template>
  <div id="app" :style="theme">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Roma',
  computed: {
    ...mapState({
      theme: state => {
        return {
          '--theme-background-color': state.App.theme.background_color,
          '--theme-selected-background-color': state.App.theme.selected_background_color,
          '--theme-global-header-color': state.App.theme.global_header_color,
          '--theme-side-menu-color': state.App.theme.side_menu_color,
          '--theme-primary-color': state.App.theme.primary_color,
          '--theme-regular-color': state.App.theme.regular_color,
          '--theme-secondary-color': state.App.theme.secondary_color,
          '--theme-border-color': state.App.theme.border_color,
          '--theme-header-menu-color': state.App.theme.header_menu_color,
          '--theme-wrapper-mask-color': state.App.theme.wrapper_mask_color,
          '--theme-scrollbar-color': state.App.theme.scrollbar_color,
          '--toot-padding': `${state.App.tootPadding}px`,
          '--base-font-size': `${state.App.fontSize}px`,
          '--specified-fonts': state.App.defaultFonts.join(', ')
        }
      }
    })
  },
  created() {
    this.$store.dispatch('App/watchShortcutsEvents')
    this.$store.dispatch('App/loadPreferences').then(conf => {
      this.$i18n.i18next.changeLanguage(conf.language.language)
    })
  },
  destroyed() {
    this.$store.dispatch('App/removeShortcutsEvents')
  }
}
</script>

<style lang="scss">
html,
body,
#app {
  --theme-background-color: purple;
  --theme-selected-background-color: orange;
  --theme-global-header-color: green;
  --theme-side-menu-color: yellow;
  --theme-primary-color: brown;
  --theme-regular-color: blue;
  --theme-secondary-color: white;
  --theme-border-color: #ebeef5;
  --theme-header-menu-color: #ffffff;
  --theme-wrapper-mask-color: rgba(255, 255, 255, 0.7);
  --theme-scrollbar-color: rgba(0, 0, 0, 0.4);

  background-color: var(--theme-background-color);
  color: var(--theme-primary-color);

  a:link,
  a:visited,
  a:hover,
  a:active,
  a:focus {
    color: #409eff;
  }

  --toot-padding: 8px;
  --base-font-size: 14px;

  font-size: var(--base-font-size);

  .theme-popover {
    background-color: #d9e1e8;
  }

  --specified-fonts: 'Noto Sans', 'Noto Sans CJK JP', 'Takaoゴシック', 'ヒラギノ角ゴ ProN W3', '-apple-system', 'BlinkMacSystemFont',
    'Segoe UI', 'Roboto', 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Noto Emoji';

  font-family: var(--specified-fonts);

  /*
  These selectors are defined in user agent stylesheet. So I override.
 */
  input,
  textarea,
  select,
  button {
    font-family: var(--specified-fonts);
  }
}

html,
body,
#app,
#global_header {
  height: 100%;
  margin: 0;
}

#app {
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--theme-scrollbar-color);
    border-radius: 10px;
  }
}

p {
  margin: 8px 0;
}

.clearfix:after {
  content: ' ';
  display: block;
  clear: both;
}
</style>
<style src="animate.css/animate.min.css"></style>
