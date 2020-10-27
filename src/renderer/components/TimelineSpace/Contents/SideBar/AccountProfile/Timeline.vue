<template>
  <div class="tabs" id="sidebar_tabs">
    <el-tabs v-model="activeName" @tab-click="handleClick" stretch>
      <el-tab-pane label="Posts" name="posts"><Posts :account="account" :buffer="buffer" /></el-tab-pane>
      <el-tab-pane label="Posts and replies" name="posts_and_replies"><PostsAndReplies :account="account" :buffer="buffer" /></el-tab-pane>
      <el-tab-pane label="Media" name="media"><Media :account="account" :buffer="buffer" /></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Posts from './Timeline/Posts'
import PostsAndReplies from './Timeline/PostsAndReplies'
import Media from './Timeline/Media'

export default {
  name: 'timeline',
  props: ['account'],
  components: {
    Posts,
    PostsAndReplies,
    Media
  },
  data() {
    return {
      activeName: 'posts',
      defaultBuffer: 200,
      buffer: 200
    }
  },
  mounted() {
    const timeline = document.getElementById('sidebar_tabs')
    if (timeline !== undefined && timeline !== null) {
      this.buffer = this.defaultBuffer + timeline.getBoundingClientRect().top
    }
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event)
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs /deep/ {
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
