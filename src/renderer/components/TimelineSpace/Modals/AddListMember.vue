<template>
  <div class="add-member">
    <el-dialog :title="$t('modals.add_list_member.title')" v-model="addListMemberModal" width="400px" custom-class="add-member-modal">
      <div class="search-account" :element-loading-background="loadingBackground">
        <el-form :inline="true">
          <input v-model="name" placeholder="Account name" class="account-name" autofocus />
          <el-button link class="search" @click="search">
            <font-awesome-icon icon="magnifying-glass" />
          </el-button>
        </el-form>
        <div class="search-results">
          <template v-for="user in accounts">
            <div class="user">
              <div class="icon">
                <img :src="user.avatar" />
              </div>
              <div class="name">
                <div class="username">
                  {{ username(user) }}
                </div>
                <div class="acct">@{{ user.acct }}</div>
              </div>
              <div class="add">
                <el-button link @click="add(user)">
                  <font-awesome-icon icon="plus" />
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { Entity } from 'megalodon'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Modals/AddListMember'

export default defineComponent({
  name: 'add-list-member',
  setup() {
    const space = 'TimelineSpace/Modals/AddListMember'
    const store = useStore()
    const { t } = useTranslation()
    const { enter } = useMagicKeys()

    const name = ref<string>('')

    const loadingBackground = computed(() => store.state.App.theme.wrapper_mask_color)
    const accounts = computed(() => store.state.TimelineSpace.Modals.AddListMember.accounts)
    const addListMemberModal = computed({
      get: () => store.state.TimelineSpace.Modals.AddListMember.modalOpen,
      set: (value: boolean) => store.dispatch(`${space}/${ACTION_TYPES.CHANGE_MODAL}`, value)
    })

    whenever(enter, () => {
      search()
    })

    const username = (account: Entity.Account): string => {
      if (account.display_name !== '') {
        return account.display_name
      } else {
        return account.username
      }
    }
    const search = () => {
      store.dispatch(`${space}/${ACTION_TYPES.SEARCH}`, name.value)
    }
    const add = (account: Entity.Account) => {
      store
        .dispatch(`${space}/${ACTION_TYPES.ADD}`, account)
        .then(() => {
          store.dispatch(`${space}/${ACTION_TYPES.CHANGE_MODAL}`, false)
        })
        .catch(() => {
          ElMessage({
            message: t('message.add_user_error'),
            type: 'error'
          })
        })
    }

    return {
      name,
      loadingBackground,
      accounts,
      addListMemberModal,
      username,
      search,
      add,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
.add-member :deep() {
  .el-dialog__header {
    background-color: var(--theme-header-menu-color);
    margin-right: 0;

    .el-dialog__title {
      color: var(--theme-secondary-color);
    }
  }

  .el-dialog__body {
    background-color: var(--theme-selected-background-color);
    color: var(--theme-secondary-color);
    padding: 8px 12px 30px;
  }
}

.add-member-modal {
  .search-account {
    background-color: var(--theme-selected-background-color);

    .account-name {
      width: calc(100% - 32px);
      background-color: var(--theme-background-color);
      border: none;
      border-radius: 0 4px 4px 0;
      color: var(--theme-primary-color);
      line-height: 40px;
      height: 40px;
      padding: 0 15px;
      outline: 0;
      font-size: 14px;
      box-sizing: border-box;
    }

    .search {
      box-sizing: border-box;
      width: 24px;
      margin-left: 4px;
      color: var(--theme-secondary-color);
    }

    .search-results {
      margin-top: 12px;
      height: 200px;
      overflow: auto;

      .user {
        display: flex;
        box-sizing: border-box;
        padding: 4px 12px 8px;
        border-bottom: 1px solid var(--theme-border-color);
        cursor: pointer;

        .icon {
          display: inline-block;

          img {
            width: 36px;
            height: 36px;
            border-radius: 4px;
            cursor: pointer;
            display: block;
          }
        }

        .name {
          display: inline-block;
          padding-left: 8px;

          .acct {
            color: #909399;
          }

          div {
            width: auto;
            word-wrap: break-word;
          }
        }

        .add {
          margin-left: auto;
        }
      }
    }
  }
}
</style>
