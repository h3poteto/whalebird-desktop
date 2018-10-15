<template>
<div id="followers">
  <template v-for="follow in followers">
    <user :user="follow"
          :relationship="targetRelation(follow.id)"
          @followAccount="followAccount"
          @unfollowAccount="unfollowAccount"
          >
    </user>
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
    ...mapState('TimelineSpace/Contents/SideBar/AccountProfile/Followers', {
      followers: state => state.followers,
      relationships: state => state.relationships
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
    async load () {
      const followers = await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchFollowers', this.account)
        .catch(() => {
          this.$message({
            message: this.$t('message.followers_fetch_error'),
            type: 'error'
          })
        })
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchRelationships', followers)
    },
    targetRelation (id) {
      return this.relationships.find(r => r.id === id)
    },
    async followAccount (account) {
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/follow', account)
        .catch(() => {
          this.$message({
            message: this.$t('message.follow_error'),
            type: 'error'
          })
        })
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchRelationships', this.followers)
    },
    async unfollowAccount (account) {
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unfollow', account)
        .catch(() => {
          this.$message({
            message: this.$t('message.unfollow_error'),
            type: 'error'
          })
        })
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchRelationships', this.followers)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
