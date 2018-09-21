<template>
<div id="appearance">
  <h2>{{ $t('preferences.appearance.title') }}</h2>
  <div class="theme section">
    <div class="left">
      <h4>{{ $t('preferences.appearance.theme_color') }}</h4>
      <span class="status">
        <el-select v-model="theme" placeholder="theme">
          <el-option
            v-for="t in themes"
            :key="t.key"
            :label="$t(t.name)"
            :value="t.key">
          </el-option>
        </el-select>
      </span>
    </div>
    <div class="right">
      <Toot
        :displayNameStyle="displayNameStyle"
        :timeFormat="timeFormat"
        ></Toot>
    </div>
  </div>
  <div class="font section">
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
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'

export default {
  name: 'appearance',
  components: {
    Toot
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
        Theme.Dark
      ],
      timeFormats: [
        TimeFormat.Absolute,
        TimeFormat.Relative
      ]
    }
  },
  computed: {
    ...mapState('Preferences/Appearance', {
      fontSize: state => state.appearance.fontSize
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
    }
  },
  created () {
    this.$store.dispatch('Preferences/Appearance/loadAppearance')
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
