import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import General, { GeneralState } from '@/store/Preferences/General'

const state = (): GeneralState => {
  return {
    general: {
      sound: {
        fav_rb: true,
        toot: true
      },
      timeline: {
        cw: false,
        nfsw: false,
        hideAllAttachments: false
      }
    },
    loading: false
  }
}
const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: General.actions,
    mutations: General.mutations
  }
}

const app = {
  namespaced: true,
  actions: {
    loadPreferences (_) {
      return true
    }
  }
}

describe('Preferences/General', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Preferences: initStore(),
        App: app
      }
    })
  })

  describe('loadGeneral', () => {
    beforeEach(() => {
      ipcMain.once('get-preferences', (event, _) => {
        event.sender.send('response-get-preferences', {
          general: {
            sound: {
              fav_rb: false,
              toot: false
            }
          }
        })
      })
    })
    it('should be updated', async () => {
      await store.dispatch('Preferences/loadGeneral')
      expect(store.state.Preferences.general.sound.fav_rb).toEqual(false)
      expect(store.state.Preferences.general.sound.toot).toEqual(false)
      expect(store.state.Preferences.loading).toEqual(false)
    })
  })

  describe('updateSound', () => {
    beforeEach(() => {
      ipcMain.once('update-preferences', (event, config) => {
        event.sender.send('response-update-preferences', config)
      })
    })
    it('should be updated', async () => {
      await store.dispatch('Preferences/updateSound', {
        fav_rb: false,
        toot: false
      })
      expect(store.state.Preferences.general.sound.fav_rb).toEqual(false)
      expect(store.state.Preferences.general.sound.toot).toEqual(false)
      expect(store.state.Preferences.loading).toEqual(false)
    })
  })

  describe('updateTimeline', () => {
    beforeEach(() => {
      ipcMain.once('update-preferences', (event, config) => {
        event.sender.send('response-update-preferences', config)
      })
    })
    it('should be updated', async () => {
      await store.dispatch('Preferences/updateTimeline', {
        cw: true,
        nfsw: true,
        hideAllAttachments: true
      })
      expect(store.state.Preferences.general.timeline.cw).toEqual(true)
      expect(store.state.Preferences.general.timeline.nfsw).toEqual(true)
      expect(store.state.Preferences.general.timeline.hideAllAttachments).toEqual(true)
      expect(store.state.Preferences.loading).toEqual(false)
    })
  })
})
