<template>
  <div id="language">
    <h2>{{ $t('preferences.language.title') }}</h2>
    <el-form class="display-language section" label-position="top">
      <h3>{{ $t('preferences.language.language.title') }}</h3>
      <el-form-item for="language" :label="$t('preferences.language.language.description')">
        <el-select id="language" v-model="displayLanguage" placeholder="style">
          <el-option v-for="lang in languages" :key="lang.key" :label="lang.name" :value="lang.key"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form class="spellchecker section" label-position="top">
      <h3>{{ $t('preferences.language.spellchecker.title') }}</h3>
      <el-form-item for="spellcheck" :label="$t('preferences.language.spellchecker.enabled')">
        <el-switch id="spellcheck" v-model="spellcheck" active-color="#13ce66"> </el-switch>
      </el-form-item>
      <el-form-item for="spellcheck_languages">
        <el-checkbox-group id="spellcheck_languages" v-model="spellcheckLanguages">
          <el-checkbox
            v-for="language in languages"
            :label="language.key"
            :key="language.key"
            :name="language.name"
            :disabled="!spellcheck"
            >{{ language.name }}</el-checkbox
          >
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useTranslation } from 'i18next-vue'
import { ElMessage } from 'element-plus'
import { useStore } from '@/store'
import Language from '~/src/constants/language'
import { ACTION_TYPES } from '@/store/Preferences/Language'

export default defineComponent({
  name: 'language',
  setup() {
    const space = 'Preferences/Language'
    const store = useStore()
    const { t, i18next } = useTranslation()

    const languages = [
      Language.cs,
      Language.de,
      Language.en,
      Language.eu,
      Language.es_es,
      Language.fa,
      Language.fr,
      Language.gd,
      Language.hu,
      Language.id,
      Language.is,
      Language.it,
      Language.ja,
      Language.ko,
      Language.no,
      Language.pl,
      Language.pt_pt,
      Language.ru,
      Language.si,
      Language.sv_se,
      Language.tzm,
      Language.zh_cn,
      Language.zh_tw
    ]

    const displayLanguage = computed({
      get: () => store.state.Preferences.Language.language.language,
      set: (value: string) =>
        store.dispatch(`${space}/${ACTION_TYPES.CHANGE_LANGUAGE}`, value).then(key => {
          i18next.changeLanguage(key)
        })
    })

    const spellcheck = computed({
      get: () => store.state.Preferences.Language.language.spellchecker.enabled,
      set: (value: boolean) => store.dispatch(`${space}/${ACTION_TYPES.TOGGLE_SPELLCHECKER}`, value)
    })

    const spellcheckLanguages = computed({
      get: () => store.state.Preferences.Language.language.spellchecker.languages,
      set: (value: Array<string>) =>
        store.dispatch('Preferences/Language/updateSpellcheckerLanguages', value).catch(() => {
          ElMessage({
            message: t('message.language_not_support_spellchecker_error'),
            type: 'error'
          })
        })
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LOAD_LANGUAGE}`)
    })

    return {
      languages,
      displayLanguage,
      spellcheck,
      spellcheckLanguages
    }
  }
})
</script>

<style lang="scss" scoped>
#language {
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
