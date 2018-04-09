<template>
<div id="lists">
  <div class="list-timeline" v-for="message in timeline" v-bind:key="message.id">
    <toot :message="message" v-on:update="updateToot"></toot>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from './Cards/Toot'

export default {
  name: 'lists',
  props: ['list_id'],
  components: { Toot },
  computed: {
    ...mapState({
      timeline: state => state.TimelineSpace.Contents.Lists.timeline
    })
  },
  created () {
    this.load()
  },
  watch: {
    list_id: function () {
      this.load()
    }
  },
  methods: {
    load () {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.$store.dispatch('TimelineSpace/Contents/Lists/fetchTimeline', this.list_id)
        .then(() => {
          loading.close()
        })
        .catch(() => {
          loading.close()
          this.$message({
            message: 'Failed to get timeline',
            type: 'error'
          })
        })
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/Lists/updateToot', message)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
