<template>
  <el-dialog
    :title="$t('modals.list_membership.title')"
    :visible.sync="listMembershipModal"
    width="400px"
    class="list-membership-modal"
    >
    <el-checkbox-group v-model="belongToLists" v-loading="loading">
      <table class="lists">
        <tbody>
          <tr v-for="list in lists" :key="list.id">
            <td>
              <el-checkbox :label="list.id">{{ list.title }}</el-checkbox>
            </td>
          </tr>
        </tbody>
      </table>
    </el-checkbox-group>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'list-membership',
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState({
      account: state => state.TimelineSpace.Modals.ListMembership.account,
      lists: state => state.TimelineSpace.Modals.ListMembership.lists
    }),
    listMembershipModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.ListMembership.modalOpen
      },
      set (value) {
        this.$store.dispatch('TimelineSpace/Modals/ListMembership/changeModal', value)
      }
    },
    belongToLists: {
      get () {
        return this.$store.state.TimelineSpace.Modals.ListMembership.belongToLists
      },
      set (value) {
        return this.$store.dispatch('TimelineSpace/Modals/ListMembership/changeBelongToLists', value)
          .catch(() => {
            this.$message({
              message: this.$t('message.update_list_memberships_error'),
              type: 'error'
            })
          })
      }
    }
  },
  watch: {
    listMembershipModal: function (newState, oldState) {
      if (!oldState && newState) {
        this.init()
      }
    }
  },
  methods: {
    async init () {
      this.loading = true
      try {
        await this.$store.dispatch('TimelineSpace/Modals/ListMembership/fetchListMembership', this.account)
        await this.$store.dispatch('TimelineSpace/Modals/ListMembership/fetchLists')
      } catch (err) {
        this.$message({
          message: this.$t('message.lists_fetch_error'),
          type: 'error'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.lists {
  text-align: left;
  border-collapse: collapse;
  width: 100%;

  tr {
    border-bottom: solid 1px #ebeef5;

    &:first-child {
      border-top: solid 1px #ebeef5;
    }

    &:nth-child(even) {
      background-color: #fafafa;
    }

    &:hover {
      background-color: #f2f6fc;
    }

    td {
      padding: 4px 8px;
    }
  }
}
</style>
