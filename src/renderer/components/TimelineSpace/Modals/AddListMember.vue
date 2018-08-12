<template>
  <el-dialog
    :title="$t('modals.add_list_member.title')"
    :visible.sync="addListMemberModal"
    width="400px"
    class="add-member">
    <div class="search-account" :element-loading-background="loadingBackground">
      <el-form :inline="true">
        <input v-model="name" placeholder="Account name" class="account-name" v-shortkey="['enter']" @shortkey="search" autofocus></input>
        <el-button type="text" class="search" @click="search">
          <icon name="search"></icon>
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
              <div class="acct">
                @{{ user.acct }}
              </div>
            </div>
            <div class="add">
              <el-button type="text" @click="add(user)">
                <icon name="plus"></icon>
              </el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'add-list-member',
  data () {
    return {
      name: ''
    }
  },
  computed: {
    ...mapState({
      loadingBackground: state => state.App.theme.wrapper_mask_color,
      accounts: state => state.TimelineSpace.Modals.AddListMember.accounts,
      listId: state => state.TimelineSpace.Modals.AddListMember.targetListId
    }),
    addListMemberModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.AddListMember.modalOpen
      },
      set (value) {
        this.$store.dispatch('TimelineSpace/Modals/AddListMember/changeModal', value)
      }
    }
  },
  methods: {
    username (account) {
      if (account.display_name !== '') {
        return account.display_name
      } else {
        return account.username
      }
    },
    search () {
      this.$store.dispatch('TimelineSpace/Modals/AddListMember/search', this.name)
    },
    add (user) {
      this.$store.dispatch('TimelineSpace/Modals/AddListMember/add', user)
        .then(() => {
          this.addListMemberModal = false
          this.$store.dispatch('TimelineSpace/Contents/Lists/Edit/fetchMembers', this.listId)
        })
        .catch(() => {
          this.$message({
            message: 'Failed to add user',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.add-member /deep/ {
  .el-dialog__header {
    background-color: var(--theme-header-menu-color);

    .el-dialog__title {
      color: var(--theme-secondary-color);
    }
  }

  .el-dialog__body {
    background-color: var(--theme-selected-background-color);
    color: var(--theme-secondary-color);
    padding: 8px 12px 30px;
  }

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
