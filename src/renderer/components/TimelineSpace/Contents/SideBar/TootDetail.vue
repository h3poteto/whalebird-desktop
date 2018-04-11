<template>
  <div class="toot-detail">
    <div class="toot-ancestors" v-for="(message, index) in ancestors" v-bind:key="index">
      <toot :message="message"></toot>
    </div>
    <div class="original-toot">
      <toot :message="message"></toot>
    </div>
    <div class="toot-descendants" v-for="(message, index) in descendants" v-bind:key="index">
      <toot :message="message"></toot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '../Cards/Toot'

export default {
  name: 'toot-detail',
  components: { Toot },
  computed: {
    ...mapState({
      message: state => state.TimelineSpace.Contents.SideBar.TootDetail.message,
      ancestors: state => state.TimelineSpace.Contents.SideBar.TootDetail.ancestors,
      descendants: state => state.TimelineSpace.Contents.SideBar.TootDetail.descendants
    })
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/fetchToot', this.message)
        .catch(() => {
          this.$message({
            message: 'Could not fetch toot detail',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.original-toot .toot {
  background-color: #f2f6fc;
  outline: 0;
}
</style>
