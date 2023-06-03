<template>
  <div id="general" v-loading="loading" :element-loading-background="backgroundColor">
    <h2>{{ $t('preferences.general.title') }}</h2>
    <el-form class="sounds section" label-position="right" label-width="250px">
      <h3>{{ $t('preferences.general.sounds.title') }}</h3>
      <p class="description">
        {{ $t('preferences.general.sounds.description') }}
      </p>
      <el-form-item for="fav_rb" :label="$t('preferences.general.sounds.fav_rb')">
        <el-switch id="fav_rb" v-model="sound_fav_rb" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="sound_toot" :label="$t('preferences.general.sounds.toot')">
        <el-switch id="sound_toot" v-model="sound_toot" active-color="#13ce66"> </el-switch>
      </el-form-item>
    </el-form>
    <el-form class="timeline section" label-position="right" label-width="302px">
      <h3>{{ $t('preferences.general.timeline.title') }}</h3>
      <p class="description">
        {{ $t('preferences.general.timeline.description') }}
      </p>
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
    <el-form class="other section" label-position="right" label-width="250px" v-if="notDarwin">
      <h3>{{ $t('preferences.general.other.title') }}</h3>
      <el-form-item for="launch" :label="$t('preferences.general.other.launch')">
        <el-switch id="launch" v-model="other_launch" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="hideOnLaunch" :label="$t('preferences.general.other.hideOnLaunch')">
        <el-switch id="hideOnLaunch" v-model="other_hideOnLaunch" active-color="#13ce66"> </el-switch>
      </el-form-item>
    </el-form>
    <el-form class="reset section">
      <el-button type="info" @click="reset">{{ $t('preferences.general.reset.button') }}</el-button>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Preferences/General'

export default defineComponent({
  name: 'general',
  setup() {
    const space = 'Preferences/General'
    const store = useStore()
    const { t, i18next } = useTranslation()

    const loading = computed(() => store.state.Preferences.General.loading)
    const backgroundColor = computed(() => store.state.App.theme.background_color)
    const notDarwin = computed(() => store.getters[`${space}/notDarwin`])
    const sound_fav_rb = computed({
      get: () => store.state.Preferences.General.general.sound.fav_rb,
      set: (value: boolean) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_SOUND}`, {
          fav_rb: value
        })
    })
    const sound_toot = computed({
      get: () => store.state.Preferences.General.general.sound.toot,
      set: (value: boolean) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_SOUND}`, {
          toot: value
        })
    })
    const timeline_cw = computed({
      get: () => store.state.Preferences.General.general.timeline.cw,
      set: (value: boolean) =>
        store.dispatch('Preferences/General/updateTimeline', {
          cw: value
        })
    })
    const timeline_nsfw = computed({
      get: () => store.state.Preferences.General.general.timeline.nsfw,
      set: (value: boolean) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_TIMELINE}`, {
          nsfw: value
        })
    })
    const timeline_hide_attachments = computed({
      get: () => store.state.Preferences.General.general.timeline.hideAllAttachments,
      set: (value: boolean) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_TIMELINE}`, {
          hideAllAttachments: value
        })
    })
    const other_launch = computed({
      get: () => store.state.Preferences.General.general.other.launch,
      set: (value: boolean) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_OTHER}`, {
          launch: value
        })
    })
    const other_hideOnLaunch = computed({
      get: () => store.state.Preferences.General.general.other.hideOnLaunch,
      set: (value: boolean) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_OTHER}`, {
          hideOnLaunch: value
        })
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_GENERAL}`).catch(() => {
        ElMessage({
          message: t('message.preferences_load_error'),
          type: 'error'
        })
      })
    })

    const reset = () => {
      store
        .dispatch(`${space}/${ACTION_TYPES.RESET}`)
        .then(language => {
          i18next.changeLanguage(language)
        })
        .catch(() => {
          ElMessage({
            message: t('message.preferences_load_error'),
            type: 'error'
          })
        })
    }

    return {
      loading,
      backgroundColor,
      notDarwin,
      sound_fav_rb,
      sound_toot,
      timeline_cw,
      timeline_nsfw,
      timeline_hide_attachments,
      other_launch,
      other_hideOnLaunch,
      reset,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#general {
  .description {
    margin: 24px 0 20px;
  }

  .section {
    margin-bottom: 40px;
  }

  .section :deep(.el-form-item__label) {
    color: var(--theme-primary-color);
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
