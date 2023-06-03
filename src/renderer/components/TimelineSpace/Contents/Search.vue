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
      <search-account v-if="target === 'account'" :results="accounts"></search-account>
      <search-tag v-else-if="target === 'tag'" :results="tags"></search-tag>
      <search-toots v-else-if="target === 'toot'" :results="statuses"></search-toots>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import generator, { MegalodonInterface, Entity } from 'megalodon'
import { useStore } from '@/store'
import SearchAccount from './Search/Account.vue'
import SearchTag from './Search/Tag.vue'
import SearchToots from './Search/Toots.vue'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'search',
  components: { SearchAccount, SearchTag, SearchToots },
  setup() {
    const store = useStore()
    const { t } = useTranslation()
    const route = useRoute()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))

    const target = ref<string>('account')
    const query = ref<string>('')
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)
    const searchTargets = [
      {
        target: 'account',
        label: t('search.account')
      },
      {
        target: 'tag',
        label: t('search.tag')
      },
      {
        target: 'toot',
        label: t('search.toot')
      }
    ]
    const userAgent = computed(() => store.state.App.userAgent)
    const accounts = ref<Array<Entity.Account>>([])
    const tags = ref<Array<Entity.Tag>>([])
    const statuses = ref<Array<Entity.Status>>([])

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
    })

    const clear = () => {
      accounts.value = []
      tags.value = []
      statuses.value = []
    }

    const search = () => {
      clear()
      switch (target.value) {
        case 'account':
          client.value
            ?.searchAccount(query.value, { resolve: true })
            .then(res => {
              accounts.value = res.data
            })
            .catch(err => {
              console.error(err)
              ElMessage({
                message: t('message.search_error'),
                type: 'error'
              })
            })
          break
        case 'tag':
          client.value
            ?.search(`#${query.value}`, 'hashtags', { resolve: true })
            .then(res => {
              tags.value = res.data.hashtags
            })
            .catch(err => {
              console.error(err)
              ElMessage({
                message: t('message.search_error'),
                type: 'error'
              })
            })
          break
        case 'toot':
          client.value
            ?.search(query.value, 'statuses', { resolve: true })
            .then(res => {
              statuses.value = res.data.statuses
            })
            .catch(err => {
              console.error(err)
              ElMessage({
                message: t('message.search_error'),
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
      search,
      accounts,
      tags,
      statuses,
      $t: t
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
