import unreadSettings from '~/src/constants/unreadNotification'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { UnreadNotification } from '~/src/types/unreadNotification'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

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
  loadUnreadNotification: ({ commit, rootState }): Promise<boolean> => {
    return new Promise(resolve => {
      win.ipcRenderer.once('response-get-unread-notification', (_, settings: UnreadNotification) => {
        win.ipcRenderer.removeAllListeners('error-get-unread-notification')
        commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, settings)
        resolve(true)
      })
      win.ipcRenderer.once('error-get-unread-notification', () => {
        win.ipcRenderer.removeAllListeners('response-get-unread-notification')
        const settings: UnreadNotification = {
          direct: unreadSettings.Direct.default,
          local: unreadSettings.Local.default,
          public: unreadSettings.Public.default
        }
        commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, settings)
        resolve(false)
      })
      win.ipcRenderer.send('get-unread-notification', rootState.Settings.accountID)
    })
  },
  changeUnreadNotification: ({ dispatch, state, rootState }, timeline: { key: boolean }): Promise<boolean> => {
    const settings: UnreadNotification = Object.assign({}, state.unreadNotification, timeline, {
      accountID: rootState.Settings.accountID
    })
    return new Promise((resolve, reject) => {
      win.ipcRenderer.once('response-update-unread-notification', () => {
        win.ipcRenderer.removeAllListeners('error-update-unread-notification')
        dispatch('loadUnreadNotification')
        resolve(true)
      })
      win.ipcRenderer.once('error-update-unread-notification', (_, err: Error) => {
        win.ipcRenderer.removeAllListeners('response-update-unread-notification')
        reject(err)
      })
      win.ipcRenderer.send('update-unread-notification', settings)
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
