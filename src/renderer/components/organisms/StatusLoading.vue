<template>
  <div class="status-loading" tabIndex="0" @click="onClick">
    <p class="load-text">{{ $t('cards.status_loading.message') }}</p>
    <div class="fill-line"></div>
  </div>
</template>

<script>
export default {
  name: 'status-loading',
  props: {
    max_id: {
      type: String,
      default: ''
    },
    since_id: {
      type: String,
      default: ''
    }
  },
  methods: {
    onClick() {
      if (this.since_id !== '') {
        this.$emit('load_since', this.since_id)
      } else if (this.max_id !== '') {
        this.$emit('load_max', this.max_id)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status-loading {
  background-color: var(--theme-background-color);
  text-align: center;
  padding: 12px 0;
  height: 36px;
  border-bottom: 1px solid var(--theme-border-color);
  .load-text {
    cursor: pointer;
  }
}
</style>
