import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Notify } from '~/src/types/notify'
import { BaseConfig, Notification } from '~/src/types/preference'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type NotificationState = {
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
      win.ipcRenderer.send('get-preferences')
      win.ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        win.ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      win.ipcRenderer.once('response-get-preferences', (_, conf: BaseConfig) => {
        win.ipcRenderer.removeAllListeners('error-get-preferences')
        commit(MUTATION_TYPES.UPDATE_NOTIFICATION, conf.notification)
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
      win.ipcRenderer.send('update-preferences', config)
      win.ipcRenderer.once('response-update-preferences', (_, conf: BaseConfig) => {
        commit(MUTATION_TYPES.UPDATE_NOTIFICATION, conf.notification)
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
