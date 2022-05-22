<template>
  <div id="global_header">
    <el-menu
      v-if="!hide"
      :default-active="activeRoute"
      class="el-menu-vertical account-menu"
      :collapse="true"
      :router="true"
      :background-color="themeColor"
      text-color="#909399"
      active-text-color="#ffffff"
      role="menubar"
    >
      <el-menu-item
        :index="`/${account._id}/`"
        :route="{ path: `/${account._id}/home` }"
        v-for="(account, _index) in accounts"
        v-bind:key="account._id"
        role="menuitem"
      >
        <font-awesome-icon icon="circle-user" v-if="account.avatar === undefined || account.avatar === null || account.avatar === ''" />
        <FailoverImg v-else :src="account.avatar" class="avatar" :title="account.username + '@' + account.domain" />
        <FailoverImg :src="`${account.baseURL}/favicon.ico`" :failoverSrc="`${account.baseURL}/favicon.png`" class="instance-icon" />
        <span slot="title">{{ account.domain }}</span>
      </el-menu-item>
      <el-menu-item index="/login" :title="$t('global_header.add_new_account')" role="menuitem" class="add-new-account">
        <font-awesome-icon icon="plus" />
        <span slot="new">New</span>
      </el-menu-item>
    </el-menu>
    <div :class="hide ? 'space no-global-header' : 'space with-global-header'">
      <router-view :key="$route.params.id"></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import { useStore } from '@/store'
import FailoverImg from '@/components/atoms/FailoverImg.vue'
import { StreamingError } from '~/src/errors/streamingError'
import { ACTION_TYPES } from '@/store/GlobalHeader'

export default defineComponent({
  components: {
    FailoverImg
  },
  name: 'global-header',
  setup() {
    const space = 'GlobalHeader'
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18next()

    const accounts = computed(() => store.state.GlobalHeader.accounts)
    const hide = computed(() => store.state.GlobalHeader.hide)
    const themeColor = computed(() => store.state.App.theme.global_header_color)
    const activeRoute = computed(() => `/${route.path.split('/')[1]}/`)

    onMounted(() => {
      initialize()
    })

    const initialize = async () => {
      await store
        .dispatch(`${space}/initLoad`)
        .then(accounts => {
          store.dispatch(`${space}/${ACTION_TYPES.START_STREAMINGS}`).catch(err => {
            if (err instanceof StreamingError) {
              ElMessage({
                message: i18n.t('message.start_all_streamings_error', {
                  domain: err.domain
                }),
                type: 'error'
              })
            }
          })
          if (route.params.id === undefined) {
            router.push({ path: `/${accounts[0]._id}/home` })
          }
        })
        .catch(_ => {
          return router.push({ path: '/login' })
        })
    }

    return {
      accounts,
      hide,
      themeColor,
      activeRoute
    }
  },
  methods: {}
})
</script>

<style lang="scss" scoped>
.account-menu :deep(.el-menu-item) {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 0 !important;
}

#global_header {
  .account-menu {
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    width: 65px;
    padding-top: 24px;
    border: 0;

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      mix-blend-mode: overlay;
    }

    .instance-icon {
      width: 18px;
      height: 18px;
      mix-blend-mode: overlay;
      vertical-align: bottom;
      margin-left: -18px;
    }

    .is-active {
      .avatar {
        mix-blend-mode: normal;
      }

      .instance-icon {
        mix-blend-mode: normal;
      }
    }
  }

  .space {
    height: 100%;
  }

  .no-global-header {
    margin-left: 0;
  }

  .with-global-header {
    margin-left: 65px;
  }

  .add-new-account {
    align-items: center;
  }
}
</style>
