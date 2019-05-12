<template>
  <div id="follow-requests">
    <template v-for="account in requests">
      <user :user="account" :request="true" @acceptRequest="accept" @rejectRequest="reject"></user>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import User from '@/components/molecules/User'

export default {
  name: 'folllow-requests',
  components: { User },
  computed: {
    ...mapState('TimelineSpace/Contents/FollowRequests', {
      requests: state => state.requests
    })
  },
  async mounted() {
    await this.initialize()
  },
  methods: {
    async initialize() {
      await this.$store.dispatch('TimelineSpace/Contents/FollowRequests/fetchRequests').catch(_ => {
        this.$message({
          message: this.$t('message.timeline_fetch_error'),
          type: 'error'
        })
      })
    },
    accept(account) {
      this.$store.dispatch('TimelineSpace/Contents/FollowRequests/acceptRequest', account).catch(_ => {
        this.$message({
          message: this.$t('message.follow_request_accept_error'),
          type: 'error'
        })
      })
    },
    reject(account) {
      this.$store.dispatch('TimelineSpace/Contents/FollowRequests/rejectRequest', account).catch(_ => {
        this.$message({
          message: this.$t('message.follow_request_reject_error'),
          type: 'error'
        })
      })
    }
  }
}
</script>

<style lang="scss" scorped></style>
