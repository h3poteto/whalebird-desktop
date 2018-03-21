<template>
  <div id="global_header">
    <el-menu
      :default-active="defaultActive"
      class="el-menu-vertical account-menu"
      :collapse="true"
      :route="true"
      background-color="#4a5664"
      text-color="#909399"
      active-text-color="#ffffff">
      <el-menu-item :index="index.toString()" v-for="(account, index) in accounts" v-bind:key="account._id" :route="{path: `/${account._id}/home`}" @click="select(account)">
        <i class="el-icon-menu"></i>
        <span slot="title">{{ account.domain }}</span>
      </el-menu-item>
      <el-menu-item index="/login" @click="login">
        <i class="el-icon-plus"></i>
        <span slot="new">New</span>
      </el-menu-item>
    </el-menu>
    <div class="space">
      <router-view :key="$route.params.id"></router-view>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'global-header',
  computed: {
    ...mapState({
      defaultActive: state => state.GlobalHeader.defaultActive,
      accounts: state => state.GlobalHeader.accounts
    })
  },
  created () {
    this.initialize()
  },
  methods: {
    async initialize () {
      await this.$store.dispatch('GlobalHeader/removeShortcutEvents')
      this.$store.dispatch('GlobalHeader/watchShortcutEvents')
      try {
        const accounts = await this.$store.dispatch('GlobalHeader/listAccounts')
        if (this.$route.params.id === undefined) {
          return this.$router.push({ path: `/${accounts[0]._id}/home` })
        } else {
          return this.$store.dispatch('GlobalHeader/schmearMenu', this.$route.params.id)
        }
      } catch (err) {
        return this.$router.push({ path: '/login' })
      }
    },
    login () {
      return this.$router.push({ path: '/login' })
    },
    select (account) {
      console.log(account._id)
      return this.$router.push({ path: `/${account._id}/home` })
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
