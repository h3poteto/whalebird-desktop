<template>
<div id="general" v-loading="loading">
  <h2>{{ $t('preferences.general.title') }}</h2>
  <div class="toot section">
    <h3>{{ $t('preferences.general.toot.title') }}</h3>
    <p class="description">{{ $t('preferences.general.toot.description') }}</p>
    <el-select v-model="tootVisibility" placeholder="visibility">
      <el-option
        v-for="v in visibilities"
        :key="v.value"
        :label="$t(v.name)"
        :value="v.value">
      </el-option>
    </el-select>
  </div>
  <div class="sounds section">
    <h3>{{ $t('preferences.general.sounds.title') }}</h3>
    <p class="description">{{ $t('preferences.general.sounds.description') }}</p>
    <div class="selection">
      <span class="value">
        <el-switch
          v-model="sound_fav_rb"
          active-color="#13ce66">
        </el-switch>
      </span>
      <span class="title">{{ $t('preferences.general.sounds.fav_rb') }}</span>
    </div>
    <div class="selection">
      <span class="value">
        <el-switch
          v-model="sound_toot"
          active-color="#13ce66">
        </el-switch>
      </span>
      <span class="title">{{ $t('preferences.general.sounds.toot') }}</span>
    </div>
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
  .description {
    margin: 24px 0 20px;
  }

  .section {
    margin-bottom: 48px;
  }

  .selection {
    margin: 12px 0;

    .title {
      margin-left: 12px;
      font-weight: 800;
    }
  }
}
</style>
