<template>
  <div id="contents" :style="customWidth" @mouseup="dragEnd" @mousemove="resize">
    <div
      class="timeline-wrapper"
      v-loading="loading"
      :element-loading-text="$t('message.loading')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'Contents',
  setup() {
    const store = useStore()
    const { t } = useTranslation()

    const loading = computed(() => store.state.TimelineSpace.Contents.loading)

    return {
      loading,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#contents {
  height: 100%;
  box-sizing: border-box;

  .timeline-wrapper {
    height: 100%;
    width: 100%;
  }
}
</style>
