<template>
  <div id="filters">
    <h2>{{ $t('settings.filters.title') }}</h2>
    <div class="new-filter">
      <el-button type="primary" :disabled="sns === 'misskey'">
        <router-link :to="`/${id}/settings/filters/new`">
          {{ $t('settings.filters.new.title') }}
        </router-link>
      </el-button>
    </div>
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
        <template #default="scope">
          <span>{{ filters[scope.$index].context.join(',') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="expires_at" label="Expires" width="180"> </el-table-column>
      <el-table-column width="80">
        <template #default="scope">
          <el-button link>
            <router-link tag="span" :to="`/${id}/settings/filters/${filters[scope.$index].id}/edit`">
              {{ $t('settings.filters.edit.title') }}
            </router-link>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column width="80">
        <template #default="scope">
          <el-button link @click="deleteFilter(filters[scope.$index].id)">
            {{ $t('settings.filters.delete.title') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/Settings/Filters'

export default defineComponent({
  name: 'Filters',
  setup() {
    const space = 'Settings/Filters'
    const store = useStore()
    const route = useRoute()
    const { t } = useTranslation()

    const filters = computed(() => store.state.Settings.Filters.filters)
    const filtersLoading = computed(() => store.state.Settings.Filters.filtersLoading)
    const backgroundColor = computed(() => store.state.App.theme.background_color)
    const sns = computed(() => store.state.TimelineSpace.sns)
    const id = computed(() => route.params.id)

    onMounted(async () => {
      await store.dispatch(`${space}/${ACTION_TYPES.FETCH_FILTERS}`)
    })

    const deleteFilter = (id: string) => {
      ElMessageBox.confirm(t('settings.filters.delete.confirm'), 'Warning', {
        confirmButtonText: t('settings.filters.delete.confirm_ok'),
        cancelButtonText: t('settings.filters.delete.confirm_cancel'),
        type: 'warning'
      }).then(() => {
        return store.dispatch(`${space}/${ACTION_TYPES.DELETE_FILTER}`, id)
      })
    }

    return {
      filters,
      filtersLoading,
      backgroundColor,
      sns,
      id,
      deleteFilter,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
#filters {
  .new-filter {
    display: flex;
    justify-content: flex-end;

    a {
      color: var(--theme-primary-color);
      text-decoration: none;
    }
  }

  .el-table :deep() {
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
