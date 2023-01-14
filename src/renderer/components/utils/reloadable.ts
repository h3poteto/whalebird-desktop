import { Store } from 'vuex'
import { RootState } from '@/store'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { i18n } from 'i18next'
import { ElMessage } from 'element-plus'
import { ACTION_TYPES } from '@/store/TimelineSpace'

export default function useReloadable(store: Store<RootState>, route: RouteLocationNormalizedLoaded, i18next: i18n) {
  async function reloadable() {
    const account = await store.dispatch(`TimelineSpace/${ACTION_TYPES.LOCAL_ACCOUNT}`, route.params.id).catch(err => {
      ElMessage({
        message: i18next.t<string>('message.account_load_error'),
        type: 'error'
      })
      throw err
    })
    return account
  }

  return {
    reloadable
  }
}
