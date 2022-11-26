<template>
  <div id="lists">
    <div class="new-list" v-loading="creating" :element-loading-background="loadingBackground">
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
import { computed, defineComponent, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Entity } from 'megalodon'
import { useI18next } from 'vue3-i18next'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import { MUTATION_TYPES as TIMELINE_MUTATION } from '@/store/TimelineSpace'
import { ACTION_TYPES } from '@/store/TimelineSpace/Contents/Lists/Index'
import { ACTION_TYPES as SIDE_MENU_ACTION } from '@/store/TimelineSpace/SideMenu'

export default defineComponent({
  name: 'lists',
  setup() {
    const space = 'TimelineSpace/Contents/Lists/Index'
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18next()

    const title = ref<string>('')
    const creating = ref<boolean>(false)

    const lists = computed(() => store.state.TimelineSpace.Contents.Lists.Index.lists)
    const loadingBackground = computed(() => store.state.App.theme.wrapper_mask_color)
    const id = computed(() => route.params.id)

    onMounted(() => {
      store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, true)
      fetch().finally(() => {
        store.commit(`TimelineSpace/${TIMELINE_MUTATION.CHANGE_LOADING}`, false)
      })
    })

    const fetch = async () => {
      return store.dispatch(`${space}/${ACTION_TYPES.FETCH_LISTS}`).catch(() => {
        ElMessage({
          message: i18n.t('message.lists_fetch_error'),
          type: 'error'
        })
      })
    }
    const createList = async () => {
      creating.value = true
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.CREATE_LIST}`, title.value)
        await store.dispatch(`${space}/${ACTION_TYPES.FETCH_LISTS}`)
      } catch (err) {
        ElMessage({
          message: i18n.t('message.list_create_error'),
          type: 'error'
        })
      } finally {
        creating.value = false
      }
      await store.dispatch(`TimelineSpace/SideMenu/${SIDE_MENU_ACTION.FETCH_LISTS}`)
    }
    const edit = (list: Entity.List) => {
      return router.push(`/${id.value}/lists/${list.id}/edit`)
    }
    const del = (list: Entity.List) => {
      ElMessageBox.confirm(i18n.t('lists.index.delete.confirm.message'), i18n.t('lists.index.delete.confirm.title'), {
        confirmButtonText: i18n.t('lists.index.delete.confirm.ok'),
        cancelButtonText: i18n.t('lists.index.delete.confirm.cancel'),
        type: 'warning'
      })
        .then(() => {
          store.dispatch(`${space}/${ACTION_TYPES.DELETE_LIST}`, list)
        })
        .catch(() => {})
    }

    return {
      id,
      creating,
      title,
      lists,
      loadingBackground,
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
