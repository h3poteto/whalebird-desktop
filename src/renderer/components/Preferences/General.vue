<template>
<div id="general" v-loading="loading">
  <h2>{{ $t('preferences.general.title') }}</h2>
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
                :label="$t(v.name)"
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

export default {
  name: 'general',
  data () {
    return {
      visibilities: [
        Visibility.Public,
        Visibility.Unlisted,
        Visibility.Private
      ]
    }
  },
  computed: {
    ...mapState({
      loading: state => state.Preferences.General.loading
    }),
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
