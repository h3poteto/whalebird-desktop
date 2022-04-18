<template>
  <div id="filters">
    <h2>{{ $t('settings.filters.title') }}</h2>
    <div class="new-filter">
      <el-button type="primary" :disabled="sns === 'misskey'">
        <router-link tag="span" :to="`/${id()}/settings/filters/new`">
          {{ $t('settings.filters.new.title') }}
        </router-link>
      </el-button>
    </div>
    <template>
      <el-table
        :data="filters"
        tooltip-effect="dark"
        empty-text="No filters"
        style="width: 100%"
        v-loading="filtersLoading"
        :element-loading-background="backgroundColor"
      >
        <el-table-column prop="phrase" label="Keyword" width="180">
        </el-table-column>
        <el-table-column label="Context">
          <template slot-scope="scope">
            <span>{{ filters[scope.$index].context.join(',') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expires_at" label="Expires" width="180">
        </el-table-column>
        <el-table-column width="80">
          <template slot-scope="scope">
            <el-button type="text">
              <router-link
                tag="span"
                :to="`/${id()}/settings/filters/${
                  filters[scope.$index].id
                }/edit`"
              >
                {{ $t('settings.filters.edit.title') }}
              </router-link>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="deleteFilter(filters[scope.$index].id)"
            >
              {{ $t('settings.filters.delete.title') }}
            </el-button>
          </template>
        </el-table-column>
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
      filters: (state) => state.filters,
      filtersLoading: (state) => state.filtersLoading,
    }),
    ...mapState({
      backgroundColor: (state) => state.App.theme.background_color,
    }),
    ...mapState('TimelineSpace', {
      sns: (state) => state.sns,
    }),
  },
  async created() {
    await this.$store.dispatch('Settings/Filters/fetchFilters')
  },
  methods: {
    id() {
      return this.$route.params.id
    },
    deleteFilter(id) {
      this.$confirm(this.$t('settings.filters.delete.confirm'), 'Warning', {
        confirmButtonText: this.$t('settings.filters.delete.confirm_ok'),
        cancelButtonText: this.$t('settings.filters.delete.confirm_cancel'),
        type: 'warning',
      }).then(() => {
        return this.$store.dispatch('Settings/Filters/deleteFilter', id)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
#filters {
  .new-filter {
    display: flex;
    justify-content: flex-end;
  }

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
