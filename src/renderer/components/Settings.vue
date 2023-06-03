<template>
  <el-container id="settings">
    <el-header class="header">
      <el-row>
        <el-col :span="23">
          <h1>{{ $t('settings.title') }}</h1>
        </el-col>
        <el-col :span="1" class="close-area">
          <el-button class="close-button" link role="button" @click="close">
            <font-awesome-icon icon="xmark" />
          </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside width="240px" class="menu">
        <el-menu
          :default-active="activeRoute"
          class="setting-menu"
          :text-color="primaryColor"
          :background-color="backgroundColor"
          :router="true"
        >
          <el-menu-item :index="`/${id}/settings/general`">
            <font-awesome-icon icon="gear" class="icon" size="lg" />
            <span>{{ $t('settings.general.title') }}</span>
          </el-menu-item>
          <el-menu-item :index="`/${id}/settings/timeline`">
            <font-awesome-icon icon="align-left" class="icon" size="lg" />
            <span>{{ $t('settings.timeline.title') }}</span>
          </el-menu-item>
          <el-menu-item :index="`/${id}/settings/filters`">
            <font-awesome-icon icon="filter" class="icon" size="lg" />
            <span>{{ $t('settings.filters.title') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import { MUTATION_TYPES } from '@/store/Settings'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'Settings',
  setup() {
    const space = `Settings`
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const { escape } = useMagicKeys()
    const { t } = useTranslation()

    const primaryColor = computed(() => store.state.App.theme.primary_color)
    const backgroundColor = computed(() => store.state.App.theme.background_color)
    const id = computed(() => route.params.id)
    const activeRoute = computed(() => route.path)

    onMounted(() => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_ACCOUNT_ID}`, parseInt(id.value as string))
      router.push(`/${id.value}/settings/general`)
    })

    whenever(escape, () => {
      close()
    })

    const close = () => {
      router.push(`/${id.value}/home`)
    }

    return {
      primaryColor,
      backgroundColor,
      id,
      activeRoute,
      close,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#settings {
  height: 100%;
  overflow: auto;

  .header {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);
    user-select: none;
  }

  .close-area {
    display: flex;
    align-items: center;

    .close-button {
      font-size: 28px;
    }
  }

  .menu {
    text-align: right;
    padding-left: 24px;

    .el-menu {
      border-right: solid 1px var(--theme-border-color);
    }

    .setting-menu {
      height: 100%;
      user-select: none;
    }

    .setting-menu :deep(.icon) {
      margin-right: 9px;
    }
  }
}
</style>
