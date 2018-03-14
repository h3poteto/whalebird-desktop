<template>
  <div id="global_header">
    <el-menu
      :default-active="defaultActive"
      class="el-menu-vertical account-menu"
      @open="accountSelected"
      @close="accountClosed"
      :collapse="isCollapse"
      :route="true"
      background-color="#4a5664"
      text-color="#909399"
      active-text-color="#ffffff">
      <el-menu-item :index="index.toString()" v-for="(account, index) in accounts" v-bind:key="account._id" :route="{path: `/${account._id}/home`}">
        <i class="el-icon-menu"></i>
        <span slot="title">{{ account.domain }}</span>
      </el-menu-item>
      <el-menu-item index="/login" @click="login">
        <i class="el-icon-plus"></i>
        <span slot="new">New</span>
      </el-menu-item>
    </el-menu>
    <div class="space">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'global-header',
  data () {
    return {
      isCollapse: true,
      defaultActive: '0'
    }
  },
  computed: {
    ...mapState({
      accounts: state => state.GlobalHeader.accounts
    })
  },
  created () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.$store.dispatch('GlobalHeader/listAccounts')
      .then((accounts) => {
        loading.close()
        return this.$router.push({ path: `/${accounts[0]._id}/home` })
      })
      .catch(() => {
        loading.close()
        return this.$router.push({ path: '/login' })
      })
  },
  methods: {
    accountSelected (key, keyPath) {
      console.log(key, keyPath)
    },
    accountClosed (key, keyPath) {
      console.log(key, keyPath)
    },
    login () {
      return this.$router.push({ path: '/login' })
    }
  }
}
</script>

<style lang="scss">
body { font-family: 'Source Sans Pro', sans-serif; }

html, body, #app, #global_header {
  height: 100%;
  margin: 0;
}

p {
  margin: 8px 0;
}

#global_header {
  .account-menu {
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    width: 65px;
  }

  .space {
    margin-left: 65px;
  }
}
</style>
