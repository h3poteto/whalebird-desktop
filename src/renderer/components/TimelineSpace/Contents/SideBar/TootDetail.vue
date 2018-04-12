<template>
  <div class="toot-detail" ref="detail">
    <div class="toot-ancestors" v-for="(message, index) in ancestors" v-bind:key="'ancestors-' + index">
      <toot :message="message"></toot>
    </div>
    <div class="original-toot" ref="original">
      <toot :message="message"></toot>
    </div>
    <div class="toot-descendants" v-for="(message, index) in descendants" v-bind:key="'descendants' + index">
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
  watch: {
    message: function () {
      this.load()
    }
  },
  methods: {
    load () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/fetchToot', this.message)
        .then(() => {
          const toot = this.$refs.original
          toot.scrollIntoView()
        })
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
.original-toot{
  .toot{
    background-color: #f2f6fc;
    outline: 0;
  }
}
</style>
