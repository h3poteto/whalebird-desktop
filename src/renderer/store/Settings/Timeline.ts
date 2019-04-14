import { ipcRenderer } from 'electron'
import unreadSettings from '~/src/constants/unreadNotification'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

interface UnreadNotification {
  direct: boolean,
  local: boolean,
  public: boolean
}

export interface TimelineState {
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
  loadUnreadNotification: ({ commit, rootState }): Promise<boolean> => {
    return new Promise(resolve => {
      ipcRenderer.once('response-get-unread-notification', (_, settings: UnreadNotification) => {
        ipcRenderer.removeAllListeners('error-get-unread-notification')
        commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, settings)
        resolve(true)
      })
      ipcRenderer.once('error-get-unread-notification', () => {
        ipcRenderer.removeAllListeners('response-get-unread-notification')
        const settings: UnreadNotification = {
          direct: unreadSettings.Direct.default,
          local: unreadSettings.Local.default,
          public: unreadSettings.Public.default
        }
        commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, settings)
        resolve(false)
      })
      ipcRenderer.send('get-unread-notification', rootState.Settings.accountID)
    })
  },
  changeUnreadNotification: ({ dispatch, state, rootState }, timeline: object): Promise<boolean> => {
    const settings = Object.assign({}, state.unreadNotification, timeline, {
      accountID: rootState.Settings.accountID
    })
    return new Promise((resolve, reject) => {
      ipcRenderer.once('response-update-unread-notification', () => {
        ipcRenderer.removeAllListeners('error-update-unread-notification')
        dispatch('loadUnreadNotification')
        resolve(true)
      })
      ipcRenderer.once('error-update-unread-notification', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-unread-notification')
        reject(err)
      })
      ipcRenderer.send('update-unread-notification', settings)
    })
  }
}

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Timeline
