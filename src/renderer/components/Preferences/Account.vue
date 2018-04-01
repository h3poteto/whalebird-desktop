<template>
<div id="account">
  <h2>Account</h2>
  <div class="connected-account">
    <h3>Connected Accounts</h3>
    <template>
      <el-table
        :data="accounts"
        stripe
        empty-text="No accounts"
        style="width: 100%">
        <el-table-column
          prop="username"
          label="Username"
          width="240">
        </el-table-column>
        <el-table-column
          prop="domain"
          label="Domain">
        </el-table-column>
        <el-table-column
          label="Association">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="deleteAccount(scope.$index, accounts)"
              type="text" icon="el-icon-close">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'account',
  computed: {
    ...mapState({
      accounts: state => state.Preferences.Account.accounts
    })
  },
  created () {
    this.$store.commit('Preferences/changeActive', '2')
    this.loadAccounts()
  },
  methods: {
    loadAccounts () {
      this.$store.dispatch('Preferences/Account/loadAccounts')
        .catch(() => {
          this.$message({
            message: 'Failed to load accounts',
            type: 'error'
          })
        })
    },
    deleteAccount (account) {
      // TODO:
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
