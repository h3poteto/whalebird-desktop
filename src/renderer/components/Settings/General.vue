<template>
  <div id="general">
    <h2>{{ $t('settings.general.title') }}</h2>
    <el-form class="toot section" label-width="250px" label-position="right" size="default">
      <h3>{{ $t('settings.general.toot.title') }}</h3>
      <el-form-item for="visibility" :label="$t('settings.general.toot.visibility.description')">
        <el-select id="visibility" :model-value="tootVisibility" placeholder="visibility" @change="changeVisibility">
          <el-option v-for="v in visibilities" :key="v.value" :label="$t(v.name)" :value="v.value"> </el-option>
        </el-select>
        <p class="notice">
          {{ $t('settings.general.toot.visibility.notice') }}
        </p>
      </el-form-item>
      <el-form-item for="sensitive" :label="$t('settings.general.toot.sensitive.description')">
        <el-switch id="sensitive" :model-value="tootSensitive" @change="changeSensitive"></el-switch>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Settings/General'
import Visibility from '~/src/constants/visibility'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'General',
  setup() {
    const space = 'Settings/General'
    const store = useStore()
    const { t } = useTranslation()

    const visibilities = [Visibility.Public, Visibility.Unlisted, Visibility.Private]

    const tootVisibility = computed({
      get: () => store.state.Settings.General.visibility,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.SET_VISIBILITY}`, value)
    })
    const tootSensitive = computed({
      get: () => store.state.Settings.General.sensitive,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.SET_SENSITIVE}`, value)
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.FETCH_SETTINGS}`)
    })

    const changeVisibility = (value: number) => {
      tootVisibility.value = value
    }
    const changeSensitive = (value: boolean) => {
      tootSensitive.value = value
    }

    return {
      visibilities,
      tootVisibility,
      tootSensitive,
      changeVisibility,
      changeSensitive,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#general {
  .section {
    margin-bottom: 40px;
  }

  .section :deep(.el-form-item__label) {
    color: var(--theme-primary-color);
  }

  .notice {
    color: #c0c4cc;
    font-size: 12px;
  }
}
</style>
