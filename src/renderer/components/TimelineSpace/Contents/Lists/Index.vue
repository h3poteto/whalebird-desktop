<template>
  <div id="lists">
    <div class="list" v-for="list in lists" :key="list.id">
      <router-link tag="span" class="title" :to="`/${id()}/lists/${list.id}`">
        {{ list.title }}
      </router-link>
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
    id () {
      return this.$route.params.id
    },
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

    .title {
      cursor: pointer;
    }
  }
}
</style>
