<template>
  <div id="account">
    <h2>{{ $t('preferences.account.title') }}</h2>
    <el-form class="connected-account section">
      <h3>{{ $t('preferences.account.connected') }}</h3>
      <el-form-item>
        <el-table
          :data="accounts"
          tooltip-effect="dark"
          empty-text="No accounts"
          style="width: 100%"
          v-loading="accountLoading"
          :element-loading-background="backgroundColor"
        >
          <el-table-column prop="username" :label="$t('preferences.account.username')"> </el-table-column>
          <el-table-column prop="domain" :label="$t('preferences.account.domain')"> </el-table-column>
          <el-table-column :label="$t('preferences.account.association')">
            <template #default="scope">
              <el-button
                class="action"
                link
                @click.prevent="
                  removeAccount(
                    scope.$index,
                    accounts.map(a => a.id)
                  )
                "
              >
                <font-awesome-icon icon="xmark" />
                {{ $t('preferences.account.remove_association') }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column :label="$t('preferences.account.order')" width="60">
            <template #default="scope">
              <div class="allow-up">
                <el-button
                  class="arrow-up action"
                  link
                  @click.prevent="
                    backward(
                      scope.$index,
                      accounts.map(a => a.id)
                    )
                  "
                >
                  <font-awesome-icon icon="arrow-up" />
                </el-button>
              </div>
              <div class="allow-down">
                <el-button
                  class="arrow-down action"
                  link
                  @click.prevent="
                    forward(
                      scope.$index,
                      accounts.map(a => a.id)
                    )
                  "
                >
                  <font-awesome-icon icon="arrow-down" />
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-popconfirm
          :confirm-button-text="$t('preferences.account.confirm')"
          :cancel-button-text="$t('preferences.account.cancel')"
          :title="$t('preferences.account.confirm_message')"
          @confirm="removeAllAssociations"
        >
          <template #reference>
            <el-button type="danger">{{ $t('preferences.account.remove_all_associations') }}</el-button>
          </template>
        </el-popconfirm>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useTranslation } from 'i18next-vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/Preferences/Account'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'account',
  setup() {
    const space = 'Preferences/Account'
    const store = useStore()
    const { t } = useTranslation()
    const router = useRouter()

    const accounts = computed(() =>
      store.state.Preferences.Account.accounts.map(([a, s]) => ({
        id: a.id,
        username: a.username,
        domain: s.domain
      }))
    )
    const accountLoading = computed(() => store.state.Preferences.Account.accountLoading)
    const backgroundColor = computed(() => store.state.App.theme.background_color)

    onMounted(() => {
      loadAccounts()
    })

    const loadAccounts = async () => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_ACCOUNT_LOADING}`, true)
      try {
        await store.dispatch(`${space}/${ACTION_TYPES.LOAD_ACCOUNTS}`)
      } catch (err) {
        ElMessage({
          message: t('message.account_load_error'),
          type: 'error'
        })
      } finally {
        store.commit(`${space}/${MUTATION_TYPES.UPDATE_ACCOUNT_LOADING}`, false)
      }
    }

    const removeAccount = (index: number, accounts: Array<number>) => {
      store
        .dispatch(`${space}/${ACTION_TYPES.REMOVE_ACCOUNT}`, accounts[index])
        .then(() => {
          loadAccounts()
        })
        .catch(() => {
          ElMessage({
            message: t('message.account_remove_error'),
            type: 'error'
          })
        })
    }

    const forward = (index: number, accounts: Array<number>) => {
      store.dispatch(`${space}/${ACTION_TYPES.FORWARD_ACCOUNT}`, accounts[index]).then(() => {
        loadAccounts()
      })
    }

    const backward = (index: number, accounts: Array<number>) => {
      store.dispatch(`${space}/${ACTION_TYPES.BACKWARD_ACCOUNT}`, accounts[index]).then(() => {
        loadAccounts()
      })
    }

    const removeAllAssociations = () => {
      store.dispatch(`${space}/${ACTION_TYPES.REMOVE_ALL_ACCOUNTS}`).then(() => {
        router.push('/login/form')
      })
    }

    return {
      accounts,
      accountLoading,
      backgroundColor,
      removeAccount,
      forward,
      backward,
      removeAllAssociations
    }
  }
})
</script>

<style lang="scss" scoped>
#account {
  .section {
    margin-bottom: 40px;
  }

  .section :deep(.el-form-item__label) {
    color: var(--theme-primary-color);
  }

  .connected-account {
    .el-table :deep() {
      tr,
      th,
      td {
        background-color: var(--theme-background-color);
        color: var(--theme-primary-color);
        border-bottom: 1px solid var(--theme-border-color);
      }
    }

    .el-table::before {
      background-color: var(--theme-border-color);
    }

    .allow-up,
    .allow-down {
      display: inline-block;
    }

    .action {
      font-size: var(--base-font-size);
    }
  }

  /* stylelint-disable-next-line selector-class-pattern */
  .action :deep(.svg-inline--fa) {
    padding-right: 4px;
  }
}
</style>
