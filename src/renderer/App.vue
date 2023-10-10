<template>
  <div id="app" :style="theme">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, onUnmounted } from 'vue'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/App'
import { useActiveElement, useMagicKeys, whenever } from '@vueuse/core'
import { logicAnd } from '@vueuse/math'
import { MUTATION_TYPES } from '@/store/TimelineSpace/Modals/Shortcut'

export default defineComponent({
  name: 'Whalebird',
  setup() {
    const space = 'App'
    const store = useStore()
    const { i18next } = useTranslation()
    const { Shift_Slash } = useMagicKeys()
    const activeElement = useActiveElement()

    const theme = computed(() => ({
      '--theme-background-color': store.state.App.theme.background_color,
      '--theme-selected-background-color': store.state.App.theme.selected_background_color,
      '--theme-global-header-color': store.state.App.theme.global_header_color,
      '--theme-side-menu-color': store.state.App.theme.side_menu_color,
      '--theme-primary-color': store.state.App.theme.primary_color,
      '--theme-regular-color': store.state.App.theme.regular_color,
      '--theme-secondary-color': store.state.App.theme.secondary_color,
      '--theme-border-color': store.state.App.theme.border_color,
      '--theme-header-menu-color': store.state.App.theme.header_menu_color,
      '--theme-wrapper-mask-color': store.state.App.theme.wrapper_mask_color,
      '--theme-scrollbar-color': store.state.App.theme.scrollbar_color,
      '--toot-padding': `${store.state.App.tootPadding}px`,
      '--base-font-size': `${store.state.App.fontSize}px`,
      '--specified-fonts': store.state.App.defaultFonts.join(', ')
    }))
    const shortcutEnabled = computed(() => activeElement.value?.tagName !== 'TEXTAREA' && activeElement.value?.tagName !== 'INPUT')

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.WATCH_SHORTCUT_EVENTS}`)
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_PREFERENCES}`).then(conf => {
        i18next.changeLanguage(conf.language.language)
      })
    })
    onUnmounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.REMOVE_SHORTCUT_EVENTS}`)
    })

    whenever(logicAnd(Shift_Slash, shortcutEnabled), async () => {
      store.commit(`TimelineSpace/Modals/Shortcut/${MUTATION_TYPES.CHANGE_MODAL}`, true)
    })

    return {
      theme
    }
  }
})
</script>

<style lang="scss">
html,
body,
#app {
  --theme-background-color: #ffffff;
  --theme-selected-background-color: #f2f6fc;
  --theme-global-header-color: #4a5664;
  --theme-side-menu-color: #373d48;
  --theme-primary-color: #303133;
  --theme-regular-color: #606266;
  --theme-secondary-color: #909399;
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

  --toot-padding: 4px;
  --base-font-size: 14px;

  font-size: var(--base-font-size);
  line-height: 1.42;

  .theme-popover {
    background-color: #d9e1e8;
  }

  --specified-fonts: 'Noto Sans', 'Noto Sans CJK JP', 'Takaoゴシック', 'ヒラギノ角ゴ W3', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
    'Roboto', 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Noto Emoji';

  font-family: var(--specified-fonts);

  /*
  These selectors are defined in user agent stylesheet. So I override.
 */
  input,
  textarea,
  select,
  button {
    font-family: var(--specified-fonts);
    unicode-bidi: plaintext;
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

p:first-child, p:last-child {
  margin: 0;
}

p {
  margin: 5px 0px;
}

.clearfix::after {
  content: ' ';
  display: block;
  clear: both;
}
</style>
<style src="animate.css/animate.min.css"></style>
