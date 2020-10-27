<template>
  <div class="tabs">
    <el-tabs v-model="activeName" @tab-click="handleClick" stretch>
      <el-tab-pane label="Posts" name="posts"><Posts :account="account" /></el-tab-pane>
      <el-tab-pane label="Posts and replies" name="posts_and_replies"><PostsAndReplies :account="account" /></el-tab-pane>
      <el-tab-pane label="Media" name="media"><Media :account="account" /></el-tab-pane>
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
      activeName: 'posts'
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
  .el-tabs__item {
    color: unset;
  }

  .el-tabs__item.is-active {
    color: #409eff;
  }
}
</style>
