<template>
<div id="language">
  <h2>{{ $t('preferences.language.title') }}</h2>
  <el-form class="display-language section" label-position="top" size="small">
    <el-form-item for="language" :label="$t('preferences.language.language_description')">
      <el-select id="language" v-model="displayLanguage" placeholder="style">
        <el-option
          v-for="lang in languages"
          :key="lang.key"
          :label="lang.name"
          :value="lang.key">
        </el-option>
      </el-select>
      <p class="notice">{{ $t('preferences.language.notice') }}</p>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
import Language from '~/src/constants/language'

export default {
  name: 'language',
  data () {
    return {
      languages: [
        Language.de,
        Language.en,
        Language.fr,
        Language.ja,
        Language.ko,
        Language.pl
      ]
    }
  },
  computed: {
    displayLanguage: {
      get () {
        return this.$store.state.Preferences.Language.language.language
      },
      set (value) {
        this.$store.dispatch('Preferences/Language/changeLanguage', value)
          .then(() => {
            this.confirm()
          })
      }
    }
  },
  created () {
    this.$store.dispatch('Preferences/Language/loadLanguage')
  },
  methods: {
    confirm () {
      this.$confirm(
        this.$t('preferences.language.confirm.message'),
        this.$t('preferences.language.confirm.title'),
        {
          confirmButtonText: this.$t('preferences.language.confirm.ok'),
          cancelButtonText: this.$t('preferences.language.confirm.cancel'),
          type: 'warning'
        }
      )
        .then(() => {
          this.$store.dispatch('Preferences/Language/relaunch')
        })
        .cancel(() => {
        })
    }
  }
}
</script>

<style lang="scss" scoped>
#language {
  .section /deep/ {
    margin-bottom: 40px;

    .el-form-item__label {
      color: var(--theme-primary-color);
    }
  }

  .notice {
    color: #c0c4cc;
    font-size: 12px;
  }
}
</style>
