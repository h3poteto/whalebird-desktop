<template>
<div id="language">
  <h2>{{ $t('preferences.language.title') }}</h2>
  <div class="display-language">
    <table class="language">
      <tbody>
        <tr>
          <td class="title">{{ $t('preferences.language.display_language') }}</td>
          <td class="status">
            <el-select v-model="displayLanguage" placeholder="style">
              <el-option
                v-for="lang in languages"
                :key="lang.key"
                :label="lang.name"
                :value="lang.key">
              </el-option>
            </el-select>
          </td>
        </tr>
      </tbody>
    </table>
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
        Language.en,
        Language.ja
      ]
    }
  },
  computed: {
    displayLanguage: {
      get () {
        return this.$store.state.Preferences.Language.language.language
      },
      set (value) {
        return this.$store.dispatch('Preferences/Language/changeLanguage', value)
      }
    }
  },
  created () {
    this.$store.dispatch('Preferences/Language/loadLanguage')
  }
}
</script>

<style lang="scss" scoped>
#language {
  table {
    width: 100%;
  }

  td {
    padding: 16px 0;
  }

  .title {
    text-align: right;
    width: 50%;
  }

  .status {
    width: 50%;
    text-align: center;
  }
}
</style>
