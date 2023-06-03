<template>
  <div id="appearance">
    <h2>{{ $t('preferences.appearance.title') }}</h2>
    <el-form class="theme section" label-position="top">
      <div class="left">
        <el-form-item for="theme" :label="$t('preferences.appearance.theme_color')">
          <el-select id="theme" v-model="theme" placeholder="theme">
            <el-option v-for="t in themes" :key="t.key" :label="$t(t.name)" :value="t.key"> </el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="right">
        <Toot :displayNameStyle="displayNameStyle" :timeFormat="timeFormat"></Toot>
      </div>
    </el-form>
    <div class="color-pallet section" v-if="customizeThemeColor">
      <color-pallet></color-pallet>
    </div>
    <el-form class="font section" label-position="top">
      <el-form-item for="font-family" :label="$t('preferences.appearance.font_family')">
        <el-select id="font-family" v-model="font" placeholder="fonts">
          <el-option v-for="f in fontList" :key="f" :label="f" :value="f" />
        </el-select>
      </el-form-item>
      <el-form-item for="font-size" :label="$t('preferences.appearance.font_size')">
        <el-input-number id="font-size" :model-value="fontSize" :min="9" :max="72" @change="updateFontSize"></el-input-number>
      </el-form-item>
    </el-form>
    <el-form class="toot-padding section" label-position="top">
      <el-form-item for="toot-padding" :label="$t('preferences.appearance.toot_padding')">
        <el-input-number id="toot-padding" :model-value="tootPadding" :min="0" :max="24" @change="updateTootPadding"></el-input-number>
      </el-form-item>
    </el-form>
    <el-form class="display-style section" label-position="top">
      <el-form-item for="display-style" :label="$t('preferences.appearance.display_style.title')">
        <el-select id="display-style" v-model="displayNameStyle" placeholder="style">
          <el-option v-for="style in nameStyles" :key="style.value" :label="$t(style.name)" :value="style.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form class="time-format section" label-position="top">
      <el-form-item for="time-format" :label="$t('preferences.appearance.time_format.title')">
        <el-select id="time-format" v-model="timeFormat" placeholder="format">
          <el-option v-for="format in timeFormats" :key="format.value" :label="$t(format.name)" :value="format.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import Toot from './Appearance/Toot.vue'
import ColorPallet from './Appearance/ColorPallet.vue'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import { ACTION_TYPES } from '@/store/Preferences/Appearance'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'appearance',
  components: {
    Toot,
    ColorPallet
  },
  setup() {
    const space = 'Preferences/Appearance'
    const store = useStore()
    const { t } = useTranslation()

    const nameStyles = [DisplayStyle.DisplayNameAndUsername, DisplayStyle.DisplayName, DisplayStyle.Username]
    const themes = [Theme.System, Theme.Light, Theme.Dark, Theme.SolarizedLight, Theme.SolarizedDark, Theme.KimbieDark, Theme.Custom]
    const timeFormats = [TimeFormat.Absolute, TimeFormat.Relative]

    const fontSize = computed(() => store.state.Preferences.Appearance.appearance.fontSize)
    const fontList = computed(() => store.state.Preferences.Appearance.fonts)
    const tootPadding = computed(() => store.state.Preferences.Appearance.appearance.tootPadding)
    const theme = computed({
      get: () => store.state.Preferences.Appearance.appearance.theme,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_THEME}`, value)
    })
    const displayNameStyle = computed({
      get: () => store.state.Preferences.Appearance.appearance.displayNameStyle,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_DISPLAY_NAME_STYLE}`, value)
    })
    const timeFormat = computed({
      get: () => store.state.Preferences.Appearance.appearance.timeFormat,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_TIME_FORMAT}`, value)
    })
    const customizeThemeColor = computed(() => theme.value === Theme.Custom.key)
    const font = computed({
      get: () => store.state.Preferences.Appearance.appearance.font,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.UPDATE_FONT}`, value)
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_APPEARANCE}`)
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_FONTS}`)
    })

    const updateFontSize = async (value: number) => {
      await store.dispatch(`${space}/${ACTION_TYPES.UPDATE_FONT_SIZE}`, value)
    }
    const updateTootPadding = async (value: number) => {
      store.dispatch(`${space}/${ACTION_TYPES.UPDATE_TOOT_PADDING}`, value)
    }
    return {
      nameStyles,
      themes,
      timeFormats,
      fontSize,
      fontList,
      tootPadding,
      theme,
      displayNameStyle,
      timeFormat,
      customizeThemeColor,
      font,
      updateFontSize,
      updateTootPadding,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#appearance {
  box-sizing: border-box;

  .theme {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .right {
      margin-left: 40px;
    }
  }

  .section {
    margin-bottom: 40px;
  }

  .section :deep(.el-form-item__label) {
    color: var(--theme-primary-color);
  }
}
</style>
