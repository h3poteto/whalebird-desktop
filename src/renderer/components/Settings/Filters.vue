<template>
  <div id="filters">
    <h2>{{ $t('settings.filters.title') }}</h2>
    <template>
      <el-table
        :data="filters"
        tooltip-effect="dark"
        empty-text="No filters"
        style="width: 100%"
        v-loading="filtersLoading"
        :element-loading-background="backgroundColor"
      >
        <el-table-column prop="phrase" label="Keyword" width="180"> </el-table-column>
        <el-table-column label="Context">
          <template slot-scope="scope">
            <span>{{ filters[scope.$index].context.join(',') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expires_at" label="Expires" width="180"> </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Filters',
  computed: {
    ...mapState('Settings/Filters', {
      filters: state => state.filters,
      filtersLoading: state => state.filtersLoading
    }),
    ...mapState({
      backgroundColor: state => state.App.theme.background_color
    })
  },
  async created() {
    await this.$store.dispatch('Settings/Filters/fetchFilters')
  }
}
</script>

<style lang="scss" scoped>
#filters {
  .el-table /deep/ {
    tr,
    th,
    td,
    .el-table__empty-block {
      background-color: var(--theme-background-color);
      color: var(--theme-primary-color);
      border-bottom: 1px solid var(--theme-border-color);
    }
  }

  .el-table::before {
    background-color: var(--theme-border-color);
  }
}
</style>
