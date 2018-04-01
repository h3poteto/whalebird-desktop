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
        style="width: 100%"
        v-loading="accountLoading">
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
              @click.native.prevent="removeAccount(scope.$index, accounts)"
              type="text">
              <i class="el-icon-close"></i> Remove association
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
  data () {
    return {
      openRemoveDialog: false
    }
  },
  computed: {
    ...mapState({
      accounts: state => state.Preferences.Account.accounts,
      accountLoading: state => state.Preferences.Account.accountLoading
    })
  },
  created () {
    this.$store.commit('Preferences/changeActive', '2')
    this.loadAccounts()
  },
  methods: {
    async loadAccounts () {
      this.$store.commit('Preferences/Account/updateAccountLoading', true)
      try {
        const accounts = await this.$store.dispatch('Preferences/Account/loadAccounts')
        await this.$store.dispatch('Preferences/Account/fetchUsername', accounts)
        this.$store.commit('Preferences/Account/updateAccountLoading', false)
      } catch (err) {
        this.$store.commit('Preferences/Account/updateAccountLoading', false)
        return this.$message({
          message: 'Failed to load accounts',
          type: 'error'
        })
      }
    },
    removeAccount (index, accounts) {
      this.$store.dispatch('Preferences/Account/removeAccount', accounts[index])
        .then(() => {
          this.loadAccounts()
        })
        .catch(() => {
          this.$message({
            message: 'Failed to remove the association',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
