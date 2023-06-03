<template>
  <div id="edit_filter">
    <h2>{{ $t('settings.filters.edit.title') }}</h2>
    <FilterForm v-model="filter" @cancel="cancel" @onSubmit="onSubmit" :loading="loading" :sns="sns"> </FilterForm>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import FilterForm from './form.vue'
import { ACTION_TYPES } from '@/store/Settings/Filters/Edit'

export default defineComponent({
  name: 'EditFilter',
  props: ['filter_id'],
  components: { FilterForm },
  setup(props) {
    const space = 'Settings/Filters/Edit'
    const store = useStore()
    const router = useRouter()
    const { t } = useTranslation()
    const { filter_id } = toRefs(props)

    const loading = computed(() => store.state.Settings.Filters.Edit.loading)
    const sns = computed(() => store.state.TimelineSpace.sns)
    const filter = computed({
      get: () => store.state.Settings.Filters.Edit.filter,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.EDIT_FILTER}`, value)
    })

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.FETCH_FILTER}`, filter_id.value)
    })

    const cancel = () => router.go(-1)
    const onSubmit = () => {
      store
        .dispatch(`${space}/${ACTION_TYPES.UPDATE_FILTER}`)
        .then(() => {
          router.go(-1)
        })
        .catch(err => {
          console.error(err)
          ElMessage({
            message: t('message.update_filter_error'),
            type: 'error'
          })
        })
    }

    return {
      loading,
      sns,
      filter,
      cancel,
      onSubmit,
      $t: t
    }
  }
})
</script>
