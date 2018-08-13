<template>
<div id="follows">
  <template v-for="follow in follows">
    <user :user="follow"></user>
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
    ...mapState({
      follows: state => state.TimelineSpace.Contents.SideBar.AccountProfile.Follows.follows
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
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchFollows', this.account)
        .catch(() => {
          this.$message({
            message: this.$t('message.follows_fetch_error'),
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
