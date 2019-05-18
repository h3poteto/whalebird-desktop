<template>
  <div id="search">
    <div class="search-header">
      <el-form :inline="true">
        <el-select v-model="target" :placeholder="$t('search.search')" class="search-target">
          <el-option v-for="item in searchTargets" :key="item.target" :label="item.label" :value="item.target"> </el-option>
        </el-select>
        <input
          v-model="query"
          :placeholder="$t('search.keyword')"
          class="search-keyword"
          v-shortkey.avoid
          v-on:keyup.enter="search"
          autofocus
        />
        <div class="clearfix"></div>
      </el-form>
    </div>
    <div class="search-result">
      <search-account v-if="target === 'account'"></search-account>
      <search-tag v-else-if="target === 'tag'"></search-tag>
      <search-toots v-else-if="target === 'toot'"></search-toots>
    </div>
  </div>
</template>

<script>
import SearchAccount from './Search/Account'
import SearchTag from './Search/Tag'
import SearchToots from './Search/Toots'

export default {
  name: 'search',
  components: { SearchAccount, SearchTag, SearchToots },
  data() {
    return {
      target: 'account',
      query: ''
    }
  },
  computed: {
    searchTargets: {
      get() {
        return [
          {
            target: 'account',
            label: this.$t('search.account')
          },
          {
            target: 'tag',
            label: this.$t('search.tag')
          },
          {
            target: 'toot',
            label: this.$t('search.toot')
          }
        ]
      }
    }
  },
  methods: {
    search() {
      switch (this.target) {
        case 'account':
          this.$store.dispatch('TimelineSpace/Contents/Search/Account/search', this.query).catch(() => {
            this.$message({
              message: this.$t('message.search_error'),
              type: 'error'
            })
          })
          break
        case 'tag':
          this.$store.dispatch('TimelineSpace/Contents/Search/Tag/search', `#${this.query}`).catch(() => {
            this.$message({
              message: this.$t('message.search_error'),
              type: 'error'
            })
          })
          break
        case 'toot':
          this.$store.dispatch('TimelineSpace/Contents/Search/Toots/search', this.query).catch(() => {
            this.$message({
              message: this.$t('message.search_error'),
              type: 'error'
            })
          })
          break
        default:
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#search {
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

    .search-keyword {
      float: left;
      width: 80%;
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
