<template>
<div id="hashtag">
  <div class="search-header" v-loading="false">
    <el-form :ineline="true">
      <input v-model="tag" placeholder="Tag name" class="search-keyword" v-shortkey="['enter']" @shortkey="search" autofocus></input>
    </el-form>
  </div>
  <router-view></router-view>
</div>
</template>

<script>
export default {
  name: 'hashtag',
  data () {
    return {
      tag: ''
    }
  },
  methods: {
    id () {
      return this.$route.params.id
    },
    search () {
      this.$router.push({ path: `/${this.id()}/hashtag/${this.tag}` })
    }
  }
}
</script>

<style lang="scss" scoped>
#hashtag {
  border-top: 1px solid var(--theme-border-color);

  .search-header {
    background-color: var(--theme-selected-background-color);
    padding: 8px 12px;

    .search-keyword {
      width: 100%;
      background-color: var(--theme-background-color);
      border: none;
      border-radius: 0 4px 4px 0;
      color: var(--theme-primary-color);
      line-height: 40px;
      height: 40px;
      padding: 0 15px;
      outline: 0;
      font-size: 14px;
      box-sizing: border-box;
    }
  }
}
</style>
