<template>
  <div class="members">
    <template v-for="account in members">
      <user :user="account" :remove="true" @removeAccount="removeAccount"></user>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import User from '../Cards/User'

export default {
  name: 'edit-list',
  props: ['list_id'],
  components: { User },
  computed: {
    ...mapState({
      members: state => state.TimelineSpace.Contents.Lists.Edit.members
    })
  },
  created () {
    this.init()
  },
  methods: {
    async init () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Edit/fetchMembers', this.list_id)
      } catch (err) {
        this.$message({
          message: 'Failed to fetch members',
          type: 'error'
        })
      } finally {
        loading.close()
      }
    },
    async removeAccount (account) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Edit/removeAccount', {
          account: account,
          listId: this.list_id
        })
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Edit/fetchMembers', this.list_id)
      } catch (err) {
        this.$message({
          message: 'Failed to remove user',
          type: 'error'
        })
      } finally {
        loading.close()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.members {
}
</style>
