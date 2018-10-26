<template>
<div id="general">
  <div class="toot section">
    <h3>{{ $t('settings.general.toot.title') }}</h3>
    <p class="description">{{ $t('settings.general.toot.description') }}</p>
    <el-select v-model="tootVisibility" placeholder="visibility">
      <el-option
        v-for="v in visibilities"
        :key="v.value"
        :label="$t(v.name)"
        :value="v.value">
      </el-option>
    </el-select>
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
      ],
      tootVisibility: Visibility.Public.value
    }
  }
}
</script>

<style lang="scss" scoped>
#general {
  .description {
    margin: 24px 0 20px;
  }

  .section {
    margin-bottom: 40px;
  }
}
</style>
