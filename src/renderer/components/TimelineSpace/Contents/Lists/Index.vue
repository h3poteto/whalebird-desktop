<template>
  <div id="lists">
    <div style="width: 100%; height: 120px" v-loading="loading" :element-loading-background="backgroundColor" v-if="loading" />
    <div class="new-list" v-else>
      <el-form :inline="true">
        <input v-model="title" :placeholder="$t('lists.index.new_list')" class="list-title" />
        <el-button link class="create" @click="createList">
          <font-awesome-icon icon="plus" />
        </el-button>
      </el-form>
    </div>
    <div class="list" v-for="list in lists" :key="list.id">
      <router-link tag="div" class="title" :to="`/${id}/lists/${list.id}`">
        {{ list.title }}
      </router-link>
      <div class="tools">
        <el-button link @click="edit(list)">
          <font-awesome-icon :icon="['far', 'pen-to-square']" />
        </el-button>
        <el-button link @click="del(list)">
          <font-awesome-icon :icon="['far', 'trash-can']" />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'lists',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18next()

    const title = ref<string>('')
    const loading = ref<boolean>(false)

    const lists = ref<Array<Entity.List>>([])
    const backgroundColor = computed(() => store.state.App.theme.background_color)
    const userAgent = computed(() => store.state.App.userAgent)

    const win = (window as any) as MyWindow
    const id = computed(() => route.params.id)
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      loading.value = true
      await load().finally(() => (loading.value = false))
    })

    const load = async () => {
      if (!client.value) return
      try {
        const res = await client.value.getLists()
        lists.value = res.data
      } catch (err) {
        console.error(err)
        ElMessage({
          message: i18n.t('message.lists_fetch_error'),
          type: 'error'
        })
      }
    }

    const createList = async () => {
      if (!client.value) return
      loading.value = true
      try {
        await client.value.createList(title.value)
        await load()
      } catch (err) {
        console.error(err)
        ElMessage({
          message: i18n.t('message.list_create_error'),
          type: 'error'
        })
      } finally {
        loading.value = false
      }
    }
    const edit = (list: Entity.List) => {
      return router.push(`/${id.value}/lists/${list.id}/edit`)
    }
    const del = (list: Entity.List) => {
      ElMessageBox.confirm(i18n.t('lists.index.delete.confirm.message'), i18n.t('lists.index.delete.confirm.title'), {
        confirmButtonText: i18n.t('lists.index.delete.confirm.ok'),
        cancelButtonText: i18n.t('lists.index.delete.confirm.cancel'),
        type: 'warning'
      }).then(async () => {
        if (!client.value) return
        await client.value.deleteList(list.id)
        await load()
      })
    }

    return {
      id,
      loading,
      title,
      lists,
      backgroundColor,
      createList,
      edit,
      del
    }
  }
})
</script>

<style lang="scss" scoped>
#lists {
  .new-list {
    background-color: var(--theme-selected-background-color);
    padding: 8px 12px;

    .list-title {
      width: calc(100% - 32px);
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

    .create {
      box-sizing: border-box;
      width: 24px;
      margin-left: 4px;
      color: var(--theme-secondary-color);
    }
  }

  .list {
    padding: 8px 24px;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid var(--theme-border-color);

    .title {
      cursor: pointer;
    }
  }
}
</style>
