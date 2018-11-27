<template>
<div class="tag" @click="openTag(tag)">
  <div class="icon">
    <icon name="hashtag"></icon>
  </div>
  <div class="name">
    {{ tag.name }}
  </div>
</div>
</template>

<script>
export default {
  name: 'tag',
  props: {
    tag: {
      type: Object,
      default: null
    }
  },
  methods: {
    openTag (tag) {
      this.$router.push(`/${this.id()}/hashtag/${tag.name}`)
    },
    id () {
      return this.$route.params.id
    }
  }
}
</script>

<style lang="scss" scoped>
.tag {
  align-items: center;
  border-bottom: 1px solid var(--theme-border-color);
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 46px;
  padding: 4px 12px 8px;

  .icon {
    padding: 4px 0 0 8px;
  }

  .name {
    padding: 0 8px;
  }
}
</style>
