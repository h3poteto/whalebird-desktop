import { Store } from 'vuex'
import { RootState } from '@/store'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { i18n } from 'i18next'
import { ElMessage } from 'element-plus'
import { ACTION_TYPES } from '@/store/TimelineSpace'
import { ACTION_TYPES as GLOBAL_ACTION } from '@/store/GlobalHeader'

export default function useReloadable(store: Store<RootState>, route: RouteLocationNormalizedLoaded, i18next: i18n) {
  async function reloadable() {
    const account = await store.dispatch(`TimelineSpace/${ACTION_TYPES.LOCAL_ACCOUNT}`, route.params.id).catch(err => {
      ElMessage({
        message: i18next.t('message.account_load_error'),
        type: 'error'
      })
      throw err
    })
    await store.dispatch(`GlobalHeader/${GLOBAL_ACTION.STOP_USER_STREAMINGS}`)
    await store.dispatch(`TimelineSpace/${ACTION_TYPES.STOP_STREAMINGS}`)
    await store.dispatch(`TimelineSpace/${ACTION_TYPES.FETCH_CONTENTS_TIMELINES}`)
    await store.dispatch(`TimelineSpace/${ACTION_TYPES.START_STREAMINGS}`)
    store.dispatch(`GlobalHeader/${GLOBAL_ACTION.START_USER_STREAMINGS}`)
    return account
  }

  return {
    reloadable
  }
}
