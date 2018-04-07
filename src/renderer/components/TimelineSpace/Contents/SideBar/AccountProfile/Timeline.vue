<template>
<div id="account_timeline">
  <template v-for="message in timeline">
    <toot :message="message" v-bind:key="message.id"></toot>
  </template>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '../../Cards/Toot'

export default {
  name: 'timeline',
  props: [ 'account' ],
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.Contents.SideBar.AccountProfile.Timeline.timeline
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
      this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/fetchTimeline', this.account)
        .catch(() => {
          this.message({
            message: 'Could not get timeline',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
