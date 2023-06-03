<template>
  <div id="new_filter">
    <h2>{{ $t('settings.filters.new.title') }}</h2>
    <FilterForm v-model="filter" @cancel="cancel" @onSubmit="onSubmit" :loading="loading" :sns="sns"> </FilterForm>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import FilterForm from './form.vue'
import { ACTION_TYPES } from '@/store/Settings/Filters/New'

export default defineComponent({
  name: 'NewFilter',
  components: { FilterForm },
  setup() {
    const space = 'Settings/Filters/New'
    const store = useStore()
    const router = useRouter()
    const { t } = useTranslation()

    const loading = computed(() => store.state.Settings.Filters.New.loading)
    const sns = computed(() => store.state.TimelineSpace.sns)
    const filter = computed({
      get: () => store.state.Settings.Filters.New.filter,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.EDIT_FILTER}`, value)
    })

    const cancel = () => router.go(-1)
    const onSubmit = () => {
      store
        .dispatch(`${space}/${ACTION_TYPES.CREATE_FILTER}`)
        .then(() => {
          router.go(-1)
        })
        .catch(err => {
          console.error(err)
          ElMessage({
            message: t('message.create_filter_error'),
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
