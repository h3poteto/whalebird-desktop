<template>
<div id="general" v-loading="loading">
  <h2>{{ $t('preferences.general.title') }}</h2>
  <el-form class="sounds section" label-position="right" label-width="250px" size="small">
    <h3>{{ $t('preferences.general.sounds.title') }}</h3>
    <p class="description">{{ $t('preferences.general.sounds.description') }}</p>
    <el-form-item for="fav_rb" :label="$t('preferences.general.sounds.fav_rb')">
      <el-switch
        id="fav_rb"
        v-model="sound_fav_rb"
        active-color="#13ce66">
      </el-switch>
    </el-form-item>
    <el-form-item for="sound_toot" :label="$t('preferences.general.sounds.toot')">
      <el-switch
        id="sound_toot"
        v-model="sound_toot"
        active-color="#13ce66">
      </el-switch>
    </el-form-item>
  </el-form>
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

  .section /deep/ {
    margin-bottom: 40px;

    .el-form-item__label {
      color: var(--theme-primary-color);
    }
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
