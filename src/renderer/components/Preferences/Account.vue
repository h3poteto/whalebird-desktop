<template>
<div id="account">
  <h2>Account</h2>
  <div class="connected-account">
    <h3>Connected Accounts</h3>
    <template>
      <el-table
        :data="accounts"
        tooltip-effect="dark"
        empty-text="No accounts"
        style="width: 100%"
        v-loading="accountLoading">
        <el-table-column
          prop="username"
          label="Username">
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
        <el-table-column
          label="Order"
          width="60">
          <template slot-scope="scope">
            <div>
              <el-button class="arrow-up" type="text" icon="el-icon-arrow-up" @click.native.prevent="forward(scope.$index, accounts)"></el-button>
            </div>
            <div>
              <el-button class="arrow-down" type="text" icon="el-icon-arrow-down" @click.native.prevent="backward(scope.$index, accounts)"></el-button>
            </div>
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
        await this.$store.dispatch('Preferences/Account/loadAccounts')
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
    },
    forward (index, accounts) {
      this.$store.dispatch('Preferences/Account/forwardAccount', accounts[index])
        .then(() => {
          this.loadAccounts()
        })
    },
    backward (index, accounts) {
      this.$store.dispatch('Preferences/Account/backwardAccount', accounts[index])
        .then(() => {
          this.loadAccounts()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
#account {
  .el-table /deep/ {
    tr,
    th,
    td {
      background-color: var(--theme-background-color);
      color: var(--theme-secondary-color);
      border-bottom: 1px solid var(--theme-border-color);
    }

  }

  .el-table::before {
    background-color: var(--theme-border-color);
  }
}

.allow-up {
  padding: 0;
}

.allow-down {
  padding: 0;
}
</style>
