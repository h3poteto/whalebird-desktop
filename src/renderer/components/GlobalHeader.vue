<template>
  <div id="global_header">
    <el-menu
      v-if="!hide"
      :default-active="activeRoute()"
       class="el-menu-vertical account-menu"
      :collapse="true"
      :router="true"
      :background-color="themeColor"
      text-color="#909399"
      active-text-color="#ffffff"
      role="menubar">
      <el-menu-item :index="`/${account._id}/home`" v-for="(account, index) in accounts" v-bind:key="account._id" role="menuitem">
        <i v-if="account.avatar === undefined || account.avatar === null || account.avatar === ''" class="el-icon-menu"></i>
        <FailoverImg v-else :src="account.avatar" class="avatar" :title="account.username + '@' + account.domain" />
        <FailoverImg
          :src="`${account.baseURL}/favicon.ico`"
          :failoverSrc="`${account.baseURL}/favicon.png`"
          class="instance-icon"
        />
        <span slot="title">{{ account.domain }}</span>
      </el-menu-item>
      <el-menu-item index="/login" :title="$t('global_header.add_new_account')" role="menuitem">
        <i class="el-icon-plus"></i>
        <span slot="new">New</span>
      </el-menu-item>
    </el-menu>
    <div :class="hide ? 'space no-global-header':'space with-global-header' ">
      <router-view :key="$route.params.id"></router-view>
    </div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'

export default {
  name: 'global-header',
  components: {
    FailoverImg
  },
  computed: {
    ...mapState('GlobalHeader', {
      accounts: state => state.accounts,
      hide: state => state.hide
    }),
    ...mapState({
      themeColor: state => state.App.theme.global_header_color
    })
  },
  created () {
    this.initialize()
  },
  methods: {
    activeRoute () {
      return this.$route.path
    },
    async initialize () {
      await this.$store.dispatch('GlobalHeader/removeShortcutEvents')
      await this.$store.dispatch('GlobalHeader/loadHide')
      this.$store.dispatch('GlobalHeader/watchShortcutEvents')
      try {
        const accounts = await this.$store.dispatch('GlobalHeader/listAccounts')
        if (this.$route.params.id === undefined) {
          return this.$router.push({ path: `/${accounts[0]._id}/home` })
        }
      } catch (err) {
        return this.$router.push({ path: '/login' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#global_header /deep/ {
  .account-menu {
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    width: 65px;
    padding-top: 24px;
    border: 0;

    .el-tooltip {
      outline: 0;
      text-align: center;
      padding: 0 !important;
    }

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
}
</style>
