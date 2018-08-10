<template>
<div id="account">
  <h2>{{ $t('preferences.account.title') }}</h2>
  <div class="connected-account">
    <h3>{{ $t('preferences.account.connected') }}</h3>
    <template>
      <el-table
        :data="accounts"
        tooltip-effect="dark"
        empty-text="No accounts"
        style="width: 100%"
        v-loading="accountLoading">
        <el-table-column
          prop="username"
          :label="$t('preferences.account.username')">
        </el-table-column>
        <el-table-column
          prop="domain"
          :label="$t('preferences.account.domain')">
        </el-table-column>
        <el-table-column
          :label="$t('preferences.account.association')">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="removeAccount(scope.$index, accounts)"
              type="text">
              <i class="el-icon-close"></i> {{ $t('preferences.account.remove_association') }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('preferences.account.order')"
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
  <div class="reset">
    <el-popover
      placement="top"
      width="160"
      v-model="deletePopoverVisible">
      <p>{{ $t('preferences.account.confirm_message') }}</p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="deletePopoverVisible = false">{{ $t('preferences.account.cancel') }}</el-button>
        <el-button type="danger" size="mini" @click="removeAllAssociations">{{ $t('preferences.account.confirm') }}</el-button>
      </div>
      <el-button slot="reference" type="danger">{{ $t('preferences.account.remove_all_associations') }}</el-button>
    </el-popover>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'account',
  data () {
    return {
      openRemoveDialog: false,
      deletePopoverVisible: false
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
    },
    removeAllAssociations () {
      this.deletePopoverVisible = false
      this.$store.dispatch('Preferences/Account/removeAllAccounts')
        .then(() => {
          this.$router.push('/login')
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

  .reset {
    margin: 24px 12px;
    text-align: right;
  }
}

.allow-up {
  padding: 0;
}

.allow-down {
  padding: 0;
}
</style>
