import { ipcRenderer } from 'electron'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Notify } from '~/src/types/notify'

interface Notification {
  notify: Notify
}

export interface NotificationState {
  notification: Notification
}

const state: NotificationState = {
  notification: {
    notify: {
      reply: true,
      reblog: true,
      favourite: true,
      follow: true
    }
  }
}

export const MUTATION_TYPES = {
  UPDATE_NOTIFICATION: 'updateNotification'
}

const mutations: MutationTree<NotificationState> = {
  [MUTATION_TYPES.UPDATE_NOTIFICATION]: (state, notification: Notification) => {
    state.notification = notification
  }
}

const actions: ActionTree<NotificationState, RootState> = {
  loadNotification: ({ commit }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      ipcRenderer.once('response-get-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        commit(MUTATION_TYPES.UPDATE_NOTIFICATION, conf.notification as Notification)
        resolve(conf)
      })
    })
  },
  updateNotify: ({ commit, state, dispatch }, notify: object) => {
    const newNotify: Notify = Object.assign({}, state.notification.notify, notify)
    const newNotification: Notification = Object.assign({}, state.notification, {
      notify: newNotify
    })
    const config = {
      notification: newNotification
    }
    return new Promise(resolve => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        commit(MUTATION_TYPES.UPDATE_NOTIFICATION, conf.notification as Notification)
        dispatch('App/loadPreferences', null, { root: true })
        resolve(conf.notification)
      })
    })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<NotificationState, RootState>
