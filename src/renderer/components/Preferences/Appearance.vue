<template>
<div id="appearance">
  <h2>{{ $t('preferences.appearance.title') }}</h2>
  <div class="theme section">
    <div class="left">
      <h4>{{ $t('preferences.appearance.theme_color') }}</h4>
      <div class="status">
        <el-select v-model="theme" placeholder="theme">
          <el-option
            v-for="t in themes"
            :key="t.key"
            :label="$t(t.name)"
            :value="t.key">
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="right">
      <Toot
        :displayNameStyle="displayNameStyle"
        :timeFormat="timeFormat"
        ></Toot>
    </div>
  </div>
  <div class="color-pallet" v-if="customizeThemeColor">
    <color-pallet></color-pallet>
  </div>
  <div class="font section">
    <h4>{{ $t('preferences.appearance.font_family') }}</h4>
    <span class="status">
      <el-select v-model="font" placeholder="fonts">
        <el-option
          v-for="f in fontList"
          :key="f"
          :label="f"
          :value="f" />
      </el-select>
    </span>
    <h4>{{ $t('preferences.appearance.font_size') }}</h4>
    <span class="status">
      <el-input-number :value="fontSize" :min="9" :max="18" @change="updateFontSize"></el-input-number>
    </span>
  </div>
  <div class="display-style section">
    <h4>{{ $t('preferences.appearance.display_style.title') }}</h4>
    <span class="status">
      <el-select v-model="displayNameStyle" placeholder="style">
        <el-option
          v-for="style in nameStyles"
          :key="style.value"
          :label="$t(style.name)"
          :value="style.value">
        </el-option>
      </el-select>
    </span>
  </div>
  <div class="time-format section">
    <h4>{{ $t('preferences.appearance.time_format.title') }}</h4>
    <span class="status">
      <el-select v-model="timeFormat" placeholder="format">
        <el-option
          v-for="format in timeFormats"
          :key="format.value"
          :label="$t(format.name)"
          :value="format.value">
        </el-option>
      </el-select>
    </span>
  </div>
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
  data () {
    return {
      nameStyles: [
        DisplayStyle.DisplayNameAndUsername,
        DisplayStyle.DisplayName,
        DisplayStyle.Username
      ],
      themes: [
        Theme.Light,
        Theme.Dark,
        Theme.SolarizedLight,
        Theme.SolarizedDark,
        Theme.KimbieDark,
        Theme.Custom
      ],
      timeFormats: [
        TimeFormat.Absolute,
        TimeFormat.Relative
      ]
    }
  },
  computed: {
    ...mapState('Preferences/Appearance', {
      fontSize: state => state.appearance.fontSize,
      fontList: state => state.fonts
    }),
    theme: {
      get () {
        return this.$store.state.Preferences.Appearance.appearance.theme
      },
      set (value) {
        this.$store.dispatch('Preferences/Appearance/updateTheme', value)
      }
    },
    displayNameStyle: {
      get () {
        return this.$store.state.Preferences.Appearance.appearance.displayNameStyle
      },
      set (value) {
        this.$store.dispatch('Preferences/Appearance/updateDisplayNameStyle', value)
      }
    },
    timeFormat: {
      get () {
        return this.$store.state.Preferences.Appearance.appearance.timeFormat
      },
      set (value) {
        this.$store.dispatch('Preferences/Appearance/updateTimeFormat', value)
      }
    },
    customizeThemeColor () {
      return this.theme === Theme.Custom.key
    },
    font: {
      get () {
        return this.$store.state.Preferences.Appearance.appearance.font
      },
      set (value) {
        this.$store.dispatch('Preferences/Appearance/updateFont', value)
      }
    }
  },
  created () {
    this.$store.dispatch('Preferences/Appearance/loadAppearance')
    this.$store.dispatch('Preferences/Appearance/loadFonts')
  },
  methods: {
    updateFontSize (value) {
      this.$store.dispatch('Preferences/Appearance/updateFontSize', value)
    }
  }
}
</script>

<style lang="scss" scoped>
#appearance {
  color: var(--theme-secondary-color);
  box-sizing: border-box;

  .theme {
    display: flex;
    align-items: flex-start;

    .right {
      margin-left: 40px;
    }
  }

  .section {
    margin-bottom: 48px;
  }
}
</style>
