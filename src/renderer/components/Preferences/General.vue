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
      ]
    }
  },
  computed: {
    ...mapState({
      loading: state => state.Preferences.General.loading
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
  }
}
</script>

<style lang="scss" scoped>
#general {
  .appearance {
    color: var(--theme-secondary-color);
    width: 100%;
    box-sizing: border-box;

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
  }

  .sounds {
    color: var(--theme-secondary-color);
    width: 100%;
    box-sizing: border-box;

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
  }
}
</style>
