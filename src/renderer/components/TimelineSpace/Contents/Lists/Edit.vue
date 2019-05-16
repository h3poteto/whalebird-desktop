<template>
  <div class="members">
    <div class="add-account">
      <el-button type="text" class="add-button" @click="addAccount">
        <icon name="plus"></icon>
      </el-button>
    </div>
    <template v-for="account in members">
      <user :user="account" :remove="true" @removeAccount="removeAccount"></user>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import User from '~/src/renderer/components/molecules/User'

export default {
  name: 'edit-list',
  props: ['list_id'],
  components: { User },
  computed: {
    ...mapState({
      members: state => state.TimelineSpace.Contents.Lists.Edit.members
    })
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.$store.commit('TimelineSpace/Contents/changeLoading', true)
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Edit/fetchMembers', this.list_id)
      } catch (err) {
        this.$message({
          message: this.$t('message.members_fetch_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/changeLoading', false)
      }
    },
    async removeAccount(account) {
      this.$store.commit('TimelineSpace/Contents/changeLoading', true)
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Edit/removeAccount', {
          account: account,
          listId: this.list_id
        })
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Edit/fetchMembers', this.list_id)
      } catch (err) {
        this.$message({
          message: this.$t('message.remove_user_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/changeLoading', false)
      }
    },
    addAccount() {
      this.$store.commit('TimelineSpace/Modals/AddListMember/setListId', this.list_id)
      this.$store.dispatch('TimelineSpace/Modals/AddListMember/changeModal', true)
    }
  }
}
</script>

<style lang="scss" scoped>
.members {
  .add-account {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);

    .add-button {
      width: 100%;
    }
  }
}
</style>
