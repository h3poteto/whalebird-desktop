<template>
<div id="account_timeline">
  <template v-for="message in timeline">
    <toot :message="message" :key="message.id" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
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
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/deleteToot', message)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
