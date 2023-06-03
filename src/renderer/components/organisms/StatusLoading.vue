<template>
  <div class="status-loading" tabIndex="0" @click="onClick">
    <img v-if="loading" src="../../assets/images/loading-spinner-wide.svg" class="load-icon" />
    <p v-else class="load-text">{{ $t('cards.status_loading.message') }}</p>
    <div class="fill-line"></div>
  </div>
</template>

<script lang="ts">
import { useTranslation } from 'i18next-vue'
import { defineComponent, toRefs } from 'vue'

export default defineComponent({
  name: 'status-loading',
  props: {
    max_id: {
      type: String,
      default: ''
    },
    since_id: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props, ctx) {
    const { t } = useTranslation()
    const { loading, since_id, max_id } = toRefs(props)
    const onClick = () => {
      if (loading.value) {
        return
      }
      if (since_id.value !== '') {
        ctx.emit('load_since', since_id.value)
      } else if (max_id.value !== '') {
        ctx.emit('load_max', max_id.value)
      }
    }

    return {
      onClick,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
.status-loading {
  background-color: var(--theme-background-color);
  text-align: center;
  padding: 12px 0;
  height: 36px;
  border-bottom: 1px solid var(--theme-border-color);

  .load-icon {
    width: 36px;
  }

  .load-text {
    cursor: pointer;
  }
}
</style>
