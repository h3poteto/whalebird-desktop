<template>
  <nav id="header_menu" :aria-label="title">
    <div class="channel">
      <h1>{{ title }}</h1>
    </div>
    <div class="tools">
      <img src="../../assets/images/loading-spinner-wide.svg" v-show="loading" class="header-loading" />
      <el-button v-show="reloadable()" link class="action" :title="$t('header_menu.reload')" @click="reload">
        <font-awesome-icon icon="rotate" />
      </el-button>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/HeaderMenu'

export default defineComponent({
  name: 'header-menu',
  setup() {
    const space = 'TimelineSpace/HeaderMenu'
    const store = useStore()
    const route = useRoute()
    const { t } = useTranslation()

    const title = computed(() => store.state.TimelineSpace.HeaderMenu.title)
    const loading = computed(() => store.state.TimelineSpace.HeaderMenu.loading)

    onMounted(() => {
      channelName()
      store.dispatch(`${space}/${ACTION_TYPES.SETUP_LOADING}`)
    })
    watch(
      () => route.name,
      () => {
        channelName()
      }
    )
    const channelName = () => {
      switch (route.name) {
        case 'home':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.home'))
          break
        case 'notifications':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.notification'))
          break
        case 'favourites':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.favourite'))
          break
        case 'bookmarks':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.bookmark'))
          break
        case 'follow-requests':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.follow_requests'))
          break
        case 'local':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.local'))
          break
        case 'public':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.public'))
          break
        case 'hashtag-list':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.hashtag'))
          break
        case 'tag':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, `#${route.params.tag}`)
          break
        case 'search':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.search'))
          break
        case 'lists':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.lists'))
          break
        case 'direct-messages':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.direct_messages'))
          break
        case 'edit-list':
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.members'))
          break
        case 'list':
          store.dispatch(`${space}/${ACTION_TYPES.FETCH_LIST}`, route.params.list_id)
          break
        default:
          console.debug(route)
          store.commit(`${space}/${MUTATION_TYPES.UPDATE_TITLE}`, t('header_menu.home'))
          break
      }
    }

    const reload = () => {
      switch (route.name) {
        case 'favourites':
        case 'bookmarks':
        case 'tag':
        case 'list':
          store.commit(`${space}/${MUTATION_TYPES.CHANGE_RELOAD}`, true)
          break
        default:
          console.error('Not implemented: ', route.name)
      }
    }
    const reloadable = () => {
      switch (route.name) {
        case 'favourites':
        case 'bookmarks':
        case 'tag':
        case 'list':
          return true
        default:
          return false
      }
    }

    return {
      title,
      loading,
      reloadable,
      reload,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#header_menu {
  background-color: var(--theme-background-color);
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  user-select: none;
  line-height: normal;

  .channel {
    margin-right: auto;

    h1 {
      margin: 0;
      line-height: 32px;
    }
  }

  .tools {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .header-loading {
      width: 18px;
    }

    .action {
      color: var(--theme-secondary-color);
      padding: 0;
      margin-left: 8px;

      &:hover {
        color: #409eff;
      }
    }
  }
}

.input-wrapper {
  position: relative;
  font-size: 14px;
  display: inline-block;
  max-width: 100%;

  input {
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: none;
    padding: 0 15px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;

    &:focus {
      outline: none;
      border-color: #409eff;
    }
  }
}
</style>
