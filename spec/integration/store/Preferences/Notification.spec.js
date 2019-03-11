import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import Notification from '@/store/Preferences/Notification'

const state = () => {
  return {
    notification: {
      notify: {
        reply: true,
        reblog: true,
        favourite: true,
        follow: true
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

const App = {
  namespaced: true,
  actions: {
    loadPreferences: jest.fn()
  }
}

describe('Preferences/Notification', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Notification: initStore(),
        App: App
      }
    })
  })

  describe('loadNotification', () => {
    beforeEach(() => {
      ipcMain.once('get-preferences', (event, _) => {
        event.sender.send('response-get-preferences', {
          notification: {
            notify: {
              reply: false,
              reblog: false,
              favourite: false,
              follow: false
            }
          }
        })
      })
      it('should be updated', async () => {
        await store.dispatch('Notification/loadNotification')
        expect(store.state.Notification.notification).toEqual({
          notify: {
            reply: false,
            reblog: false,
            favourite: false,
            follow: false
          }
        })
      })
    })
  })

  describe('updateNotify', () => {
    beforeEach(() => {
      ipcMain.once('update-preferences', (event, conf) => {
        event.sender.send('response-update-preferences', conf)
      })
    })
    it('should be updated', async () => {
      await store.dispatch('Notification/updateNotify', {
        reply: false,
        reblog: false
      })
      expect(store.state.Notification.notification).toEqual({
        notify: {
          reply: false,
          reblog: false,
          favourite: true,
          follow: true
        }
      })
      expect(App.actions.loadPreferences).toBeCalled()
    })
  })
})
