<template>
<div id="follows">
  <template v-for="follow in follows">
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
  name: 'follows',
  props: [ 'account' ],
  components: { User },
  computed: {
    ...mapState('TimelineSpace/Contents/SideBar/AccountProfile/Follows', {
      follows: state => state.follows,
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
      const follows = await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchFollows', this.account)
        .catch(() => {
          this.$message({
            message: this.$t('message.follows_fetch_error'),
            type: 'error'
          })
        })
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchRelationships', follows)
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
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchRelationships', this.follows)
    },
    async unfollowAccount (account) {
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unfollow', account)
        .catch(() => {
          this.$message({
            message: this.$t('message.unfollow_error'),
            type: 'error'
          })
        })
      await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchRelationships', this.follows)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
