<template>
<div id="general" v-loading="loading">
  <h2>General</h2>
  <div class="sounds">
    <h3>Sounds</h3>
    <table class="sounds">
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
  computed: {
    ...mapState({
      loading: state => state.Preferences.General.loading
    }),
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
.sounds {
  color: #606266;
  width: 100%;
  box-sizing: border-box;

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
</style>
