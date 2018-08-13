<template>
<div id="general" v-loading="loading">
  <h2>{{ $t('preferences.general.title') }}</h2>
  <div class="appearance">
    <h3>{{ $t('preferences.general.appearance') }}</h3>
    <table class="theme">
      <tbody>
        <tr>
          <td class="title">{{ $t('preferences.general.theme_color') }}</td>
          <td class="status">
            <el-radio v-for="t in themes" :key="t.key" v-model="theme" :label="t.key">{{ t.name }}</el-radio>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.general.font_size') }}</td>
          <td class="status">
            <el-input-number :value="fontSize" :min="9" :max="18" @change="updateFontSize"></el-input-number>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.general.display_style.title') }}</td>
          <td class="status">
            <el-select v-model="displayNameStyle" placeholder="style">
              <el-option
                v-for="style in nameStyles"
                :key="style.value"
                :label="style.name"
                :value="style.value">
              </el-option>
            </el-select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="toot">
    <h3>{{ $t('preferences.general.toot') }}</h3>
    <table>
      <tbody>
        <tr>
          <td class="title">{{ $t('preferences.general.visibility.title') }}</td>
          <td class="status">
            <el-select v-model="tootVisibility" placeholder="visibility">
              <el-option
                v-for="v in visibilities"
                :key="v.value"
                :label="v.name"
                :value="v.value">
              </el-option>
            </el-select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="sounds">
    <h3>{{ $t('preferences.general.sounds') }}</h3>
    <table>
      <tbody>
        <tr>
          <td class="title">{{ $t('preferences.general.fav_rb_sound') }}</td>
          <td class="status">
            <el-switch
              v-model="sound_fav_rb"
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">{{ $t('preferences.general.toot_sound') }}</td>
          <td class="status">
            <el-switch
              v-model="sound_toot"
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Visibility from '~/src/constants/visibility'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'

export default {
  name: 'general',
  data () {
    return {
      visibilities: [
        Visibility.Public,
        Visibility.Unlisted,
        Visibility.Private
      ],
      nameStyles: [
        DisplayStyle.DisplayNameAndUsername,
        DisplayStyle.DisplayName,
        DisplayStyle.Username
      ],
      themes: [
        Theme.Light,
        Theme.Dark
      ]
    }
  },
  computed: {
    ...mapState({
      loading: state => state.Preferences.General.loading,
      fontSize: state => state.Preferences.General.general.fontSize
    }),
    theme: {
      get () {
        return this.$store.state.Preferences.General.general.theme
      },
      set (value) {
        this.$store.dispatch('Preferences/General/updateTheme', value)
      }
    },
    displayNameStyle: {
      get () {
        return this.$store.state.Preferences.General.general.displayNameStyle
      },
      set (value) {
        this.$store.dispatch('Preferences/General/updateDisplayNameStyle', value)
      }
    },
    tootVisibility: {
      get () {
        return this.$store.state.Preferences.General.general.tootVisibility
      },
      set (value) {
        this.$store.dispatch('Preferences/General/updateTootVisibility', value)
      }
    },
    sound_fav_rb: {
      get () {
        return this.$store.state.Preferences.General.general.sound.fav_rb
      },
      set (value) {
        this.$store.dispatch('Preferences/General/updateSound', {
          fav_rb: value
        })
      }
    },
    sound_toot: {
      get () {
        return this.$store.state.Preferences.General.general.sound.toot
      },
      set (value) {
        this.$store.dispatch('Preferences/General/updateSound', {
          toot: value
        })
      }
    }
  },
  created () {
    this.$store.dispatch('Preferences/General/loadGeneral')
      .catch(() => {
        this.$message({
          message: this.$t('message.preferences_load_error'),
          type: 'error'
        })
      })
  },
  methods: {
    updateFontSize (value) {
      this.$store.dispatch('Preferences/General/updateFontSize', value)
    }
  }
}
</script>

<style lang="scss" scoped>
#general {
  table {
    width: 100%;
  }

  td {
    padding: 16px 0;
  }

  .title {
    text-align: right;
    width: 50%;
  }

  .status {
    width: 50%;
    text-align: center;
  }

  .appearance {
    color: var(--theme-secondary-color);
    width: 100%;
    box-sizing: border-box;
  }

  .toot {
    color: var(--theme-secondary-color);
    width: 100%;
    box-sizing: border-box;
  }

  .sounds {
    color: var(--theme-secondary-color);
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
