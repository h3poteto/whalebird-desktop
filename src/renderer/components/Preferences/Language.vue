<template>
  <div id="language">
    <h2>{{ $t('preferences.language.title') }}</h2>
    <el-form class="display-language section" label-position="top" size="small">
      <h3>{{ $t('preferences.language.language.title') }}</h3>
      <el-form-item for="language" :label="$t('preferences.language.language.description')">
        <el-select id="language" v-model="displayLanguage" placeholder="style">
          <el-option v-for="lang in languages" :key="lang.key" :label="lang.name" :value="lang.key"> </el-option>
        </el-select>
        <p class="notice">{{ $t('preferences.language.notice') }}</p>
      </el-form-item>
    </el-form>
    <el-form class="spellchecker section" label-position="top" size="small">
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
        <p class="notice">{{ $t('preferences.language.notice') }}</p>
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
        this.$store.dispatch('Preferences/Language/changeLanguage', value).then(() => {
          this.confirm()
        })
      }
    },
    spellcheck: {
      get() {
        return this.$store.state.Preferences.Language.language.spellchecker.enabled
      },
      set(value) {
        this.$store.dispatch('Preferences/Language/toggleSpellchecker', value).then(() => {
          this.confirm()
        })
      }
    },
    spellcheckLanguages: {
      get() {
        return this.$store.state.Preferences.Language.language.spellchecker.languages
      },
      set(value) {
        this.$store.dispatch('Preferences/Language/updateSpellcheckerLanguages', value)
      }
    }
  },
  created() {
    this.$store.dispatch('Preferences/Language/loadLanguage')
  },
  methods: {
    confirm() {
      this.$confirm(this.$t('preferences.language.confirm.message'), this.$t('preferences.language.confirm.title'), {
        confirmButtonText: this.$t('preferences.language.confirm.ok'),
        cancelButtonText: this.$t('preferences.language.confirm.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.$store.dispatch('Preferences/Language/relaunch')
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
#language {
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
