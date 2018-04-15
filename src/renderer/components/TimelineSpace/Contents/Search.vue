<template>
  <div id="search" :style="theme">
    <div class="search-header">
      <el-form :inline="true">
        <el-select v-model="target" placeholder="search" class="search-target">
          <el-option
            v-for="item in searchTargets"
            :key="item.target"
            :label="item.label"
            :value="item.target">
          </el-option>
        </el-select>
        <el-input placeholder="keyword" class="search-keyword"></el-input>
        <div class="clearfix"></div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'search',
  data () {
    return {
      target: 'account',
      searchTargets: [
        {
          target: 'account',
          label: 'Account'
        }
      ]
    }
  },
  computed: {
    ...mapState({
      theme: (state) => {
        return {
          '--theme-background-color': state.App.theme.background_color,
          '--theme-selected-background-color': state.App.theme.selected_background_color,
          '--theme-primary-color': state.App.theme.primary_color
        }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
#search {
  --theme-background-color: #ffffff;
  --theme-selected-background-color: #f2f6fc;
  --theme-primary-color: #303133;
  --theme-border-color: #ebeef5;

  border-top: 1px solid var(--theme-border-color);

  .search-header {
    background-color: var(--theme-selected-background-color);
    padding: 8px 12px;

    .search-target /deep/ {
      float: left;
      width: 20%;

      .el-input__inner {
        background-color: var(--theme-background-color);
        border: none;
        border-radius: 4px 0 0 4px;
        color: var(--theme-primary-color);
      }
    }

    .search-keyword /deep/ {
      float: left;
      width: 80%;

      .el-input__inner {
        background-color: var(--theme-background-color);
        border: none;
        border-radius: 0 4px 4px 0;
        color: var(--theme-primary-color);
      }
    }
  }
}
</style>
