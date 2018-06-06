<template>
<div id="followers">
  <template v-for="follow in followers">
    <user :user="follow"></user>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex'
import User from '../../Cards/User'

export default {
  name: 'followers',
  props: [ 'account' ],
  components: { User },
  computed: {
    ...mapState({
      followers: state => state.TimelineSpace.Contents.SideBar.AccountProfile.Followers.followers
    })
  },
  created () {
    this.load()
  },
  watch: {
    account: function (newAccount, oldAccount) {
      this.load()
    }
  },
  methods: {
    load () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchFollowers', this.account)
        .catch(() => {
          this.$message({
            message: 'Could not get followers',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
