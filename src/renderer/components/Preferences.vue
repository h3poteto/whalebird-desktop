<template>
  <el-container id="preferences">
    <el-header class="header">
      <el-row>
        <el-col :span="23">
          <h1>{{ $t('preferences.title') }}</h1>
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
          :default-active="activeRoute()"
          class="setting-menu"
          :text-color="primaryColor"
          :background-color="backgroundColor"
          :router="true"
        >
          <el-menu-item index="/preferences/general">
            <font-awesome-icon icon="gear" class="icon" size="lg" />
            <span>{{ $t('preferences.general.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/appearance">
            <font-awesome-icon icon="palette" class="icon" size="lg" />
            <span>{{ $t('preferences.appearance.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/notification">
            <font-awesome-icon icon="bell" class="icon" size="lg" />
            <span>{{ $t('preferences.notification.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/account">
            <font-awesome-icon icon="user" class="icon" size="lg" />
            <span>{{ $t('preferences.account.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/network">
            <font-awesome-icon icon="network-wired" class="icon" size="lg" />
            <span>{{ $t('preferences.network.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/language">
            <font-awesome-icon icon="language" class="icon" size="lg" />
            <span>{{ $t('preferences.language.title') }}</span>
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
import { defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'preferences',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { escape } = useMagicKeys()
    const { t } = useTranslation()

    const primaryColor = computed(() => store.state.App.theme.primary_color)
    const backgroundColor = computed(() => store.state.App.theme.background_color)

    whenever(escape, () => {
      close()
    })

    const close = () => {
      router.push({ path: '/', query: { redirect: 'home' } })
    }
    const activeRoute = () => route.path

    return {
      primaryColor,
      backgroundColor,
      close,
      activeRoute,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#preferences {
  height: 100%;
  overflow: auto;

  .header {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);
    user-select: none;

    .close-area {
      display: flex;
      align-items: center;

      .close-button {
        font-size: 28px;
      }
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
