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

<script>
import Language from '~/src/constants/language'

export default {
  name: 'language',
  data() {
    return {
      languages: [
        Language.cs,
        Language.de,
        Language.en,
        Language.es_es,
        Language.fr,
        Language.gd,
        Language.id,
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
    }
  },
  computed: {
    displayLanguage: {
      get() {
        return this.$store.state.Preferences.Language.language.language
      },
      set(value) {
        this.$store.dispatch('Preferences/Language/changeLanguage', value).then(key => {
          this.$i18n.locale = key
        })
      }
    },
    spellcheck: {
      get() {
        return this.$store.state.Preferences.Language.language.spellchecker.enabled
      },
      set(value) {
        this.$store.dispatch('Preferences/Language/toggleSpellchecker', value)
      }
    },
    spellcheckLanguages: {
      get() {
        return this.$store.state.Preferences.Language.language.spellchecker.languages
      },
      set(value) {
        this.$store.dispatch('Preferences/Language/updateSpellcheckerLanguages', value).catch(() => {
          this.$message({
            message: this.$t('message.language_not_support_spellchecker_error'),
            type: 'error'
          })
        })
      }
    }
  },
  created() {
    this.$store.dispatch('Preferences/Language/loadLanguage')
  }
}
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
