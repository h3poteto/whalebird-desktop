<template>
  <div id="appearance">
    <h2>{{ $t('preferences.appearance.title') }}</h2>
    <el-form class="theme section" size="small" label-position="top">
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
    <el-form class="font section" size="small" label-position="top">
      <el-form-item for="font-family" :label="$t('preferences.appearance.font_family')">
        <el-select id="font-family" v-model="font" placeholder="fonts">
          <el-option v-for="f in fontList" :key="f" :label="f" :value="f" />
        </el-select>
      </el-form-item>
      <el-form-item for="font-size" :label="$t('preferences.appearance.font_size')">
        <el-input-number id="font-size" :value="fontSize" :min="9" :max="18" @change="updateFontSize"></el-input-number>
      </el-form-item>
    </el-form>
    <el-form class="toot-padding section" size="small" label-position="top">
      <el-form-item for="toot-padding" :label="$t('preferences.appearance.too_padding.title')">
        <el-input-number id="toot-padding" :value="tootPadding" :min="0" :max="24" @change="updateTootPadding"></el-input-number>
      </el-form-item>
    </el-form>
    <el-form class="display-style section" size="small" label-position="top">
      <el-form-item for="display-style" :label="$t('preferences.appearance.display_style.title')">
        <el-select id="display-style" v-model="displayNameStyle" placeholder="style">
          <el-option v-for="style in nameStyles" :key="style.value" :label="$t(style.name)" :value="style.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form class="time-format section" size="small" label-position="top">
      <el-form-item for="time-format" :label="$t('preferences.appearance.time_format.title')">
        <el-select id="time-format" v-model="timeFormat" placeholder="format">
          <el-option v-for="format in timeFormats" :key="format.value" :label="$t(format.name)" :value="format.value"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Appearance/Toot'
import ColorPallet from './Appearance/ColorPallet'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'

export default {
  name: 'appearance',
  components: {
    Toot,
    ColorPallet
  },
  data() {
    return {
      nameStyles: [DisplayStyle.DisplayNameAndUsername, DisplayStyle.DisplayName, DisplayStyle.Username],
      themes: [Theme.Light, Theme.Dark, Theme.SolarizedLight, Theme.SolarizedDark, Theme.KimbieDark, Theme.Custom],
      timeFormats: [TimeFormat.Absolute, TimeFormat.Relative]
    }
  },
  computed: {
    ...mapState('Preferences/Appearance', {
      fontSize: state => state.appearance.fontSize,
      fontList: state => state.fonts,
      tootPadding: state => state.appearance.tootPadding
    }),
    theme: {
      get() {
        return this.$store.state.Preferences.Appearance.appearance.theme
      },
      set(value) {
        this.$store.dispatch('Preferences/Appearance/updateTheme', value)
      }
    },
    displayNameStyle: {
      get() {
        return this.$store.state.Preferences.Appearance.appearance.displayNameStyle
      },
      set(value) {
        this.$store.dispatch('Preferences/Appearance/updateDisplayNameStyle', value)
      }
    },
    timeFormat: {
      get() {
        return this.$store.state.Preferences.Appearance.appearance.timeFormat
      },
      set(value) {
        this.$store.dispatch('Preferences/Appearance/updateTimeFormat', value)
      }
    },
    customizeThemeColor() {
      return this.theme === Theme.Custom.key
    },
    font: {
      get() {
        return this.$store.state.Preferences.Appearance.appearance.font
      },
      set(value) {
        this.$store.dispatch('Preferences/Appearance/updateFont', value)
      }
    }
  },
  created() {
    this.$store.dispatch('Preferences/Appearance/loadAppearance')
    this.$store.dispatch('Preferences/Appearance/loadFonts')
  },
  methods: {
    async updateFontSize(value) {
      await this.$store.dispatch('Preferences/Appearance/updateFontSize', value)
    },
    async updateTootPadding(value) {
      await this.$store.dispatch('Preferences/Appearance/updateTootPadding', value)
    }
  }
}
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

  .section /deep/ {
    margin-bottom: 40px;

    .el-form-item__label {
      color: var(--theme-primary-color);
    }
  }
}
</style>
