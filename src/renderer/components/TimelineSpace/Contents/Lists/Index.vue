<template>
  <div id="lists">
    <div class="list" v-for="list in lists" :key="list.id">
      <span class="title">
        {{ list.title }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'lists',
  computed: {
    ...mapState({
      lists: state => state.TimelineSpace.Contents.Lists.Index.lists
    })
  },
  created () {
    const loading = this.$loading({
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.fetch()
      .finally(() => {
        loading.close()
      })
  },
  methods: {
    fetch () {
      return this.$store.dispatch('TimelineSpace/Contents/Lists/Index/fetchLists')
        .catch(() => {
          this.$message({
            message: 'Failed to fetch lists',
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
#lists {
  .list {
    padding: 12px 24px;
    border-bottom: 1px solid var(--theme-border-color);
  }
}
</style>
