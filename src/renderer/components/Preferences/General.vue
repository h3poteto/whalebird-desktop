<template>
  <div id="general" v-loading="loading" :element-loading-background="backgroundColor">
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
      <el-form-item for="nsfw" :label="$t('preferences.general.timeline.nsfw')">
        <el-switch id="nsfw" v-model="timeline_nsfw" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="hideAllAttachments" :label="$t('preferences.general.timeline.hideAllAttachments')">
        <el-switch id="hideAllAttachments" v-model="timeline_hide_attachments" active-color="#13ce66"> </el-switch>
      </el-form-item>
    </el-form>
    <el-form class="other section" label-position="right" label-width="250px" size="small" v-if="notDarwin">
      <h3>{{ $t('preferences.general.other.title') }}</h3>
      <el-form-item for="launch" :label="$t('preferences.general.other.launch')">
        <el-switch id="launch" v-model="other_launch" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="spellcheck" :label="$t('preferences.general.other.spellcheck.description')">
        <el-switch id="spellcheck" v-model="other_spellcheck" active-color="#13ce66"> </el-switch>
        <p class="notice">{{ $t('preferences.general.other.spellcheck.notice') }}</p>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'general',
  computed: {
    ...mapState('Preferences/General', {
      loading: state => state.loading
    }),
    ...mapState({
      backgroundColor: state => state.App.theme.background_color
    }),
    ...mapGetters('Preferences/General', ['notDarwin']),
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
    timeline_nsfw: {
      get() {
        return this.$store.state.Preferences.General.general.timeline.nsfw
      },
      set(value) {
        this.$store.dispatch('Preferences/General/updateTimeline', {
          nsfw: value
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
    },
    other_spellcheck: {
      get() {
        return this.$store.state.Preferences.General.general.other.spellcheck
      },
      set(value) {
        this.$store
          .dispatch('Preferences/General/updateOther', {
            spellcheck: value
          })
          .then(() => {
            this.confirm()
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
  },
  methods: {
    confirm() {
      this.$confirm(
        this.$t('preferences.general.other.spellcheck.confirm.message'),
        this.$t('preferences.general.other.spellcheck.confirm.title'),
        {
          confirmButtonText: this.$t('preferences.general.other.spellcheck.confirm.ok'),
          cancelButtonText: this.$t('preferences.general.other.spellcheck.confirm.cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          this.$store.dispatch('Preferences/General/relaunch')
        })
        .catch(() => {})
    }
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

  .notice {
    color: #c0c4cc;
    font-size: 12px;
  }
}
</style>
