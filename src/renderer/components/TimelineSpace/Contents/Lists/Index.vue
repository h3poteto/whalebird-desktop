<template>
<div id="lists">
  <div class="new-list" v-loading="creating" :element-loading-background="loadingBackground">
    <el-form :inline="true">
      <input v-model="title" placeholder="New List" class="list-title"></input>
      <el-button type="text" class="create" @click="createList">
        <icon name="plus"></icon>
      </el-button>
    </el-form>
  </div>
  <div class="list" v-for="list in lists" :key="list.id">
    <router-link tag="div" class="title" :to="`/${id()}/lists/${list.id}`">
      {{ list.title }}
    </router-link>
    <div class="tools">
      <el-button type="text" @click="edit(list)">
        Edit
      </el-button>
    </div>
  </div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'lists',
  data () {
    return {
      title: '',
      creating: false
    }
  },
  computed: {
    ...mapState({
      lists: state => state.TimelineSpace.Contents.Lists.Index.lists,
      loadingBackground: state => state.App.theme.wrapper_mask_color
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
    },
    async createList () {
      this.creating = true
      try {
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Index/createList', this.title)
        await this.$store.dispatch('TimelineSpace/Contents/Lists/Index/fetchLists')
      } catch (err) {
        this.$message({
          message: 'Failed to create a list',
          type: 'error'
        })
      } finally {
        this.creating = false
      }
      await this.$store.dispatch('TimelineSpace/SideMenu/fetchLists')
    },
    edit (list) {
      return this.$router.push(`/${this.id()}/lists/${list.id}/edit`)
    }
  }
}
</script>

<style lang="scss" scoped>
#lists {
  .new-list {
    background-color: var(--theme-selected-background-color);
    padding: 8px 12px;

    .list-title {
      width: calc(100% - 32px);
      background-color: var(--theme-background-color);
      border: none;
      border-radius: 0 4px 4px 0;
      color: var(--theme-primary-color);
      line-height: 40px;
      height: 40px;
      padding: 0 15px;
      outline: 0;
      font-size: 14px;
      box-sizing: border-box;
    }

    .create {
      box-sizing: border-box;
      width: 24px;
      margin-left: 4px;
      color: var(--theme-secondary-color);
    }
  }

  .list {
    padding: 4px 24px;
    display: flex;
    flex-dirrection: row;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid var(--theme-border-color);

    .title {
      cursor: pointer;
    }
  }
}
</style>
