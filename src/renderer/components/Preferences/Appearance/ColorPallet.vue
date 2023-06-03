<template>
  <el-form class="pallet" label-position="top" size="small">
    <div class="item">
      <el-form-item :label="$t('preferences.appearance.custom_theme.background_color')">
        <el-color-picker v-model="background"></el-color-picker>
      </el-form-item>
      <el-form-item :label="$t('preferences.appearance.custom_theme.selected_background_color')">
        <el-color-picker v-model="selectedBackground"></el-color-picker>
      </el-form-item>
    </div>
    <div class="item">
      <el-form-item :label="$t('preferences.appearance.custom_theme.global_header_color')">
        <el-color-picker v-model="globalHeader"></el-color-picker>
      </el-form-item>
      <el-form-item :label="$t('preferences.appearance.custom_theme.side_menu_color')">
        <el-color-picker v-model="sideMenu"></el-color-picker>
      </el-form-item>
    </div>
    <div class="item">
      <el-form-item :label="$t('preferences.appearance.custom_theme.primary_color')">
        <el-color-picker v-model="primary"></el-color-picker>
      </el-form-item>
      <el-form-item :label="$t('preferences.appearance.custom_theme.regular_color')">
        <el-color-picker v-model="regular"></el-color-picker>
      </el-form-item>
    </div>
    <div class="item">
      <el-form-item :label="$t('preferences.appearance.custom_theme.secondary_color')">
        <el-color-picker v-model="secondary"></el-color-picker>
      </el-form-item>
      <el-form-item :label="$t('preferences.appearance.custom_theme.border_color')">
        <el-color-picker v-model="border"></el-color-picker>
      </el-form-item>
    </div>
    <div class="item">
      <el-form-item :label="$t('preferences.appearance.custom_theme.header_menu_color')">
        <el-color-picker v-model="headerMenu"></el-color-picker>
      </el-form-item>
      <el-form-item :label="$t('preferences.appearance.custom_theme.wrapper_mask_color')">
        <el-color-picker v-model="wrapperMask" :show-alpha="true"></el-color-picker>
      </el-form-item>
    </div>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Preferences/Appearance'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'color-pallet',
  setup() {
    const space = 'Preferences/Appearance'
    const store = useStore()
    const { t } = useTranslation()

    const background = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.background_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          background_color: value
        })
    })
    const selectedBackground = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.selected_background_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          selected_background_color: value
        })
    })
    const globalHeader = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.global_header_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          global_header_color: value
        })
    })
    const sideMenu = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.side_menu_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          side_menu_color: value
        })
    })
    const primary = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.primary_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          primary_color: value
        })
    })
    const regular = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.regular_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          regular_color: value
        })
    })
    const secondary = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.secondary_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          secondary_color: value
        })
    })
    const border = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.border_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          border_color: value
        })
    })
    const headerMenu = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.header_menu_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          header_menu_color: value
        })
    })
    const wrapperMask = computed({
      get: () => store.state.Preferences.Appearance.appearance.customThemeColor.wrapper_mask_color,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.UPDATE_CUSTOM_THEME_COLOR}`, {
          wrapper_mask_color: value
        })
    })

    return {
      background,
      selectedBackground,
      globalHeader,
      sideMenu,
      primary,
      regular,
      secondary,
      border,
      headerMenu,
      wrapperMask,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
.pallet {
  display: flex;
  justify-content: start;

  .item {
    text-align: center;
    margin: 0 12px;

    .el-form-item {
      margin-bottom: 0;
    }

    .el-form-item__label {
      color: var(--theme-primary-color);
      text-align: center;
      line-height: unset;
    }
  }
}
</style>
