<template>
  <div id="general" v-loading="loading">
    <h2>{{ $t('preferences.general.title') }}</h2>
    <el-form class="sounds section" label-position="right" label-width="250px" size="small">
      <h3>{{ $t('preferences.general.sounds.title') }}</h3>
      <p class="description">{{ $t('preferences.general.sounds.description') }}</p>
      <el-form-item for="fav_rb" :label="$t('preferences.general.sounds.fav_rb')">
        <el-switch id="fav_rb" v-model="sound_fav_rb" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="sound_toot" :label="$t('preferences.general.sounds.toot')">
        <el-switch id="sound_toot" v-model="sound_toot" active-color="#13ce66"> </el-switch>
      </el-form-item>
    </el-form>
    <el-form class="timeline section" label-potision="right" label-width="250px" size="samll">
      <h3>{{ $t('preferences.general.timeline.title') }}</h3>
      <p class="description">{{ $t('preferences.general.timeline.description') }}</p>
      <el-form-item for="cw" :label="$t('preferences.general.timeline.cw')">
        <el-switch id="cw" v-model="timeline_cw" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="nfsw" :label="$t('preferences.general.timeline.nfsw')">
        <el-switch id="nfsw" v-model="timeline_nfsw" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="hideAllAttachments" :label="$t('preferences.general.timeline.hideAllAttachments')">
        <el-switch id="hideAllAttachments" v-model="timeline_hide_attachments" active-color="#13ce66"> </el-switch>
      </el-form-item>
    </el-form>
    <el-form class="other section" label-position="right" label-width="250px" size="small">
      <h3>{{ $t('preferences.general.other.title') }}</h3>
      <el-form-item for="launch" :label="$t('preferences.general.other.launch')">
        <el-switch id="launch" v-model="other_launch" active-color="#13ce66"> </el-switch>
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
      get() {
        return this.$store.state.Preferences.General.general.sound.fav_rb
      },
      set(value) {
        this.$store.dispatch('Preferences/General/updateSound', {
          fav_rb: value
        })
      }
    },
    sound_toot: {
      get() {
        return this.$store.state.Preferences.General.general.sound.toot
      },
      set(value) {
        this.$store.dispatch('Preferences/General/updateSound', {
          toot: value
        })
      }
    },
    timeline_cw: {
      get() {
        return this.$store.state.Preferences.General.general.timeline.cw
      },
      set(value) {
        this.$store.dispatch('Preferences/General/updateTimeline', {
          cw: value
        })
      }
    },
    timeline_nfsw: {
      get() {
        return this.$store.state.Preferences.General.general.timeline.nfsw
      },
      set(value) {
        this.$store.dispatch('Preferences/General/updateTimeline', {
          nfsw: value
        })
      }
    },
    timeline_hide_attachments: {
      get() {
        return this.$store.state.Preferences.General.general.timeline.hideAllAttachments
      },
      set(value) {
        this.$store.dispatch('Preferences/General/updateTimeline', {
          hideAllAttachments: value
        })
      }
    },
    other_launch: {
      get() {
        return this.$store.state.Preferences.General.general.other.launch
      },
      set(value) {
        this.$store.dispatch('Preferences/General/updateOther', {
          launch: value
        })
      }
    }
  },
  created() {
    this.$store.dispatch('Preferences/General/loadGeneral').catch(() => {
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
