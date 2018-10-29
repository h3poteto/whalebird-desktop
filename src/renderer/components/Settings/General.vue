<template>
<div id="general">
  <div class="toot section">
    <h3>{{ $t('settings.general.toot.title') }}</h3>
    <p class="description">{{ $t('settings.general.toot.visibility.description') }}</p>
    <el-select v-model="tootVisibility" placeholder="visibility">
      <el-option
        v-for="v in visibilities"
        :key="v.value"
        :label="$t(v.name)"
        :value="v.value">
      </el-option>
    </el-select>
    <p class="description">{{ $t('settings.general.toot.sensitive.description') }}</p>
    <el-switch v-model="tootSensitive">
    </el-switch>
  </div>
</div>
</template>

<script>
import Visibility from '~/src/constants/visibility'

export default {
  name: 'General',
  data () {
    return {
      visibilities: [
        Visibility.Public,
        Visibility.Unlisted,
        Visibility.Private
      ]
    }
  },
  computed: {
    tootVisibility: {
      get () {
        return this.$store.state.Settings.General.visibility
      },
      set (value) {
        this.$store.dispatch('Settings/General/setVisibility', value)
      }
    },
    tootSensitive: {
      get () {
        return this.$store.state.Settings.General.sensitive
      },
      set (value) {
        this.$store.dispatch('Settings/General/setSensitive', value)
      }
    }
  },
  created () {
    this.$store.dispatch('Settings/General/fetchSettings')
  }
}
</script>

<style lang="scss" scoped>
#general {
  .description {
    margin: 32px 0 20px;
  }

  .section {
    margin-bottom: 40px;
  }
}
</style>
