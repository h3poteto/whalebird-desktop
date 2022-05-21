<template>
  <div class="tag" @click="openTag(tag)">
    <div class="icon">
      <font-awesome-icon icon="hashtag" />
    </div>
    <div class="name">
      {{ tag.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { Entity } from 'megalodon'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'tag',
  props: {
    tag: {
      type: Object as PropType<Entity.Tag>,
      default: null
    }
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const id = computed(() => route.params.id)
    const openTag = (tag: Entity.Tag) => {
      router.push(`/${id.value}/hashtag/${tag.name}`)
    }

    return {
      openTag
    }
  }
})
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
