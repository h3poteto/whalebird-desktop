<template>
  <div id="sidebar_tabs">
    <el-tabs :model-value="activeName" @tab-click="handleClick" class="tabs">
      <el-tab-pane label="Posts" name="posts"><Posts :account="account" :buffer="buffer" :filters="filters" /></el-tab-pane>
      <el-tab-pane label="Posts and replies" name="posts_and_replies"
        ><PostsAndReplies :account="account" :buffer="buffer" :filters="filters"
      /></el-tab-pane>
      <el-tab-pane label="Media" name="media"><Media :account="account" :buffer="buffer" :filters="filters" /></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, onMounted } from 'vue'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import Posts from './Timeline/Posts.vue'
import PostsAndReplies from './Timeline/PostsAndReplies.vue'
import Media from './Timeline/Media.vue'

export default defineComponent({
  name: 'timeline',
  props: {
    account: {
      type: Object as PropType<Entity.Account>,
      required: true
    }
  },
  components: {
    Posts,
    PostsAndReplies,
    Media
  },
  setup() {
    const space = 'TimelineSpace/Contents/SideBar/AccountProfile/Timeline'
    const store = useStore()

    const activeName = ref<string>('posts')
    const defaultBuffer = ref<number>(200)
    const buffer = ref<number>(200)

    const filters = computed(() => store.getters[`${space}/filters`])

    onMounted(() => {
      const timeline = document.getElementById('sidebar_tabs')
      if (timeline !== undefined && timeline !== null) {
        buffer.value = defaultBuffer.value + timeline.getBoundingClientRect().top
      }
    })

    const handleClick = (tab, event) => {
      console.log(tab, event)
    }

    return {
      activeName,
      handleClick,
      buffer,
      filters
    }
  }
})
</script>

<style lang="scss" scoped>
.tabs :deep() {
  .el-tabs__header {
    background-color: var(--theme-selected-background-color);
  }

  .el-tabs__item {
    color: unset;
  }

  .el-tabs__item.is-active {
    color: #409eff;
  }
}
</style>
