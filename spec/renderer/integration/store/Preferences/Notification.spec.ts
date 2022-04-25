import { createStore, Store } from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import Notification, { NotificationState } from '@/store/Preferences/Notification'
import { MyWindow } from '~/src/types/global'
import { RootState } from '@/store'
;(window as any as MyWindow).ipcRenderer = ipcRenderer

const state = (): NotificationState => {
  return {
    notification: {
      notify: {
        reply: true,
        reblog: true,
        favourite: true,
        follow: true,
        follow_request: true,
        reaction: true,
        status: true,
        poll_vote: true,
        poll_expired: true
      }
    }
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Notification.actions,
    mutations: Notification.mutations
  }
}

const preferencesStore = () => ({
  namespaced: true,
  modules: {
    Notification: initStore()
  }
})

const App = {
  namespaced: true,
  actions: {
    loadPreferences: jest.fn()
  }
}

describe('Preferences/Notification', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        Preferences: preferencesStore(),
        App: App
      }
    })
  })

  describe('loadNotification', () => {
    beforeEach(() => {
      ipcMain.handle('get-preferences', () => {
        return {
          notification: {
            notify: {
              reply: false,
              reblog: false,
              favourite: false,
              follow: false,
              follow_request: false,
              reaction: false,
              status: false,
              poll_vote: false,
              poll_expired: false
            }
          }
        }
      })
      afterEach(() => {
        ipcMain.removeHandler('get-preferences')
      })
      it('should be updated', async () => {
        await store.dispatch('Preferences/Notification/loadNotification')
        expect(store.state.Preferences.Notification.notification).toEqual({
          notify: {
            reply: false,
            reblog: false,
            favourite: false,
            follow: false,
            follow_request: false,
            reaction: false,
            status: false,
            poll_vote: false,
            poll_expired: false
          }
        })
      })
    })
  })

  describe('updateNotify', () => {
    beforeEach(() => {
      ipcMain.handle('update-preferences', (_, conf: object) => {
        return conf
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('update-preferences')
    })
    it('should be updated', async () => {
      await store.dispatch('Preferences/Notification/updateNotify', {
        reply: false,
        reblog: false
      })
      expect(store.state.Preferences.Notification.notification).toEqual({
        notify: {
          reply: false,
          reblog: false,
          favourite: true,
          follow: true,
          follow_request: true,
          reaction: true,
          status: true,
          poll_vote: true,
          poll_expired: true
        }
      })
      expect(App.actions.loadPreferences).toBeCalled()
    })
  })
})
