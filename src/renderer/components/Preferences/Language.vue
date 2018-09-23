<template>
<div id="language">
  <h2>{{ $t('preferences.language.title') }}</h2>
  <div class="display-language">
    <p class="description">{{ $t('preferences.language.language_description') }}</p>
    <el-select v-model="displayLanguage" placeholder="style">
      <el-option
        v-for="lang in languages"
        :key="lang.key"
        :label="lang.name"
        :value="lang.key">
      </el-option>
    </el-select>
    <p class="notice">{{ $t('preferences.language.notice') }}</p>
  </div>
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
  .description {
    margin: 24px 0 20px;
  }

  .notice {
    color: #c0c4cc;
    font-size: 12px;
  }
}
</style>
