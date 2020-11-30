import unreadSettings from '~/src/constants/unreadNotification'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { UnreadNotification } from '~/src/types/unreadNotification'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

export type TimelineState = {
  unreadNotification: UnreadNotification
}

const state = (): TimelineState => ({
  unreadNotification: {
    direct: unreadSettings.Direct.default,
    local: unreadSettings.Local.default,
    public: unreadSettings.Public.default
  }
})

export const MUTATION_TYPES = {
  UPDATE_UNREAD_NOTIFICATION: 'updateUnreadNotification'
}

const mutations: MutationTree<TimelineState> = {
  [MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION]: (state, settings: UnreadNotification) => {
    state.unreadNotification = settings
  }
}

const actions: ActionTree<TimelineState, RootState> = {
  loadUnreadNotification: async ({ commit, rootState }): Promise<boolean> => {
    try {
      const settings: UnreadNotification = await win.ipcRenderer.invoke('get-unread-notification', rootState.Settings.accountID)
      commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, settings)
      return true
    } catch (err) {
      const settings: UnreadNotification = {
        direct: unreadSettings.Direct.default,
        local: unreadSettings.Local.default,
        public: unreadSettings.Public.default
      }
      commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, settings)
      return false
    }
  },
  changeUnreadNotification: async ({ dispatch, state, rootState }, timeline: { key: boolean }): Promise<boolean> => {
    const settings: UnreadNotification = Object.assign({}, state.unreadNotification, timeline, {
      accountID: rootState.Settings.accountID
    })
    await win.ipcRenderer.invoke('update-unread-notification', settings)
    dispatch('loadUnreadNotification')
    return true
  }
}

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Timeline
