<template>
<div id="general">
  <h2>{{ $t('settings.general.title') }}</h2>
  <el-form class="toot section" label-width="250px" label-position="right" size="medium">
    <h3>{{ $t('settings.general.toot.title') }}</h3>
    <el-form-item for="visibility" :label="$t('settings.general.toot.visibility.description')">
      <el-select id="visibility" v-model="tootVisibility" placeholder="visibility">
        <el-option
          v-for="v in visibilities"
          :key="v.value"
          :label="$t(v.name)"
          :value="v.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item for="sensitive" :label="$t('settings.general.toot.sensitive.description')">
      <el-switch id="sensitive" v-model="tootSensitive"></el-switch>
    </el-form-item>
  </el-form>
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
  .section /deep/ {
    margin-bottom: 40px;

    .el-form-item__label {
      color: var(--theme-primary-color);
    }
  }
}
</style>
