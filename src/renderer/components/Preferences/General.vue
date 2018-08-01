<template>
<div id="general" v-loading="loading">
  <h2>General</h2>
  <div class="appearance">
    <h3>Appearance</h3>
    <table class="theme">
      <tbody>
        <tr>
          <td class="title">Theme color:</td>
          <td class="status">
            <el-radio v-model="theme" label="white">White</el-radio>
            <el-radio v-model="theme" label="dark">Dark</el-radio>
          </td>
        </tr>
        <tr>
          <td class="title">Font size:</td>
          <td class="status">
            <el-input-number :value="fontSize" :min="9" :max="18" @change="updateFontSize"></el-input-number>
          </td>
        </tr>
        <tr>
          <td class="title">Display name style:</td>
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
    <h3>Toot</h3>
    <table>
      <tbody>
        <tr>
          <td class="title">Default Visibility:</td>
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
    <h3>Sounds</h3>
    <table>
      <tbody>
        <tr>
          <td class="title">Favourite, Reblog action sound:</td>
          <td class="status">
            <el-switch
              v-model="sound_fav_rb"
              active-color="#13ce66">
            </el-switch>
          </td>
        </tr>
        <tr>
          <td class="title">Toot action sound:</td>
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

export default {
  name: 'general',
  data () {
    return {
      nameStyles: [
        {
          name: 'DisplayName and username',
          value: 0
        },
        {
          name: 'DisplayName',
          value: 1
        },
        {
          name: 'username',
          value: 2
        }
      ],
      visibilities: [
        {
          name: 'public',
          value: 0
        },
        {
          name: 'unlisted',
          value: 1
        },
        {
          name: 'private',
          value: 2
        }
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
        return this.$store.state.Preferences.General.general.theme || 'white'
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
          message: 'Failed to load preferences',
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
