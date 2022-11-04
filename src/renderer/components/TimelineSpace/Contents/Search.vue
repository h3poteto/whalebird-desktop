<template>
  <div id="search">
    <div class="search-header">
      <el-form :inline="true">
        <el-select v-model="target" :placeholder="$t('search.search')" class="search-target" size="large">
          <el-option v-for="item in searchTargets" :key="item.target" :label="item.label" :value="item.target"> </el-option>
        </el-select>
        <input v-model="query" :placeholder="$t('search.keyword')" class="search-keyword" v-on:keyup.enter="search" autofocus />
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

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { useStore } from '@/store'
import SearchAccount from './Search/Account.vue'
import SearchTag from './Search/Tag.vue'
import SearchToots from './Search/Toots.vue'
import { ACTION_TYPES as TAG_ACTION } from '@/store/TimelineSpace/Contents/Search/Tag'
import { ACTION_TYPES as ACCOUNT_ACTION } from '@/store/TimelineSpace/Contents/Search/Account'
import { ACTION_TYPES as TOOTS_ACTION } from '@/store/TimelineSpace/Contents/Search/Toots'

export default defineComponent({
  name: 'search',
  components: { SearchAccount, SearchTag, SearchToots },
  setup() {
    const space = 'TimelineSpace/Contents/Search'
    const store = useStore()
    const i18n = useI18next()

    const target = ref<string>('account')
    const query = ref<string>('')
    const searchTargets = [
      {
        target: 'account',
        label: i18n.t('search.account')
      },
      {
        target: 'tag',
        label: i18n.t('search.tag')
      },
      {
        target: 'toot',
        label: i18n.t('search.toot')
      }
    ]

    const search = () => {
      switch (target.value) {
        case 'account':
          store.dispatch(`${space}/Tag/${ACCOUNT_ACTION.SEARCH}`, query.value).catch(() => {
            ElMessage({
              message: i18n.t('message.search_error'),
              type: 'error'
            })
          })
          break
        case 'tag':
          store.dispatch(`${space}/Tag/${TAG_ACTION.SEARCH}`, `#${query.value}`).catch(() => {
            ElMessage({
              message: i18n.t('message.search_error'),
              type: 'error'
            })
          })
          break
        case 'toot':
          store.dispatch(`${space}/Toots/${TOOTS_ACTION.SEARCH}`, query.value).catch(() => {
            ElMessage({
              message: i18n.t('message.search_error'),
              type: 'error'
            })
          })
          break
        default:
          break
      }
    }

    return {
      target,
      searchTargets,
      query,
      search
    }
  }
})
</script>

<style lang="scss" scoped>
#search {
  .search-header {
    background-color: var(--theme-selected-background-color);
    padding: 8px 12px;

    .search-target {
      float: left;
      width: 20%;
    }

    .search-target :deep(.el-input__wrapper) {
      background-color: var(--theme-background-color);
    }

    .search-target :deep(.el-input__inner) {
      background-color: var(--theme-background-color);
      border: none;
      border-radius: 4px 0 0 4px;
      color: var(--theme-primary-color);
      box-shadow: none;
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
