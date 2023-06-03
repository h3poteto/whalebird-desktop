<template>
  <div id="new_filter">
    <h2>{{ $t('settings.filters.new.title') }}</h2>
    <FilterForm v-model="filter" @cancel="cancel" @onSubmit="onSubmit" :loading="loading" :sns="sns"> </FilterForm>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTranslation } from 'i18next-vue'
import { useStore } from '@/store'
import FilterForm from './form.vue'
import { ACTION_TYPES } from '@/store/Settings/Filters/New'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'NewFilter',
  components: { FilterForm },
  setup() {
    const space = 'Settings/Filters/New'
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { t } = useTranslation()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))
    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })

    const loading = computed(() => store.state.Settings.Filters.New.loading)
    const filter = computed({
      get: () => store.state.Settings.Filters.New.filter,
      set: value => store.dispatch(`${space}/${ACTION_TYPES.EDIT_FILTER}`, value)
    })
    const sns = computed(() => account.server?.sns)

    onMounted(async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s
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
      filter,
      cancel,
      onSubmit,
      sns,
      $t: t
    }
  }
})
</script>
