import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import General, { GeneralState } from '@/store/Preferences/General'
import { MyWindow } from '~/src/types/global'
import { IpcMainInvokeEvent } from 'electron'
;((window as any) as MyWindow).ipcRenderer = ipcRenderer

const state = (): GeneralState => {
  return {
    general: {
      sound: {
        fav_rb: true,
        toot: true
      },
      timeline: {
        cw: false,
        nsfw: false,
        hideAllAttachments: false
      },
      other: {
        launch: false
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
    loadPreferences(_) {
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
      ipcMain.handle('get-preferences', () => {
        return {
          general: {
            sound: {
              fav_rb: false,
              toot: false
            }
          }
        }
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('get-preferences')
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
      ipcMain.handle('update-preferences', (_: IpcMainInvokeEvent, config: any) => {
        return config
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('update-preferences')
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
      ipcMain.handle('update-preferences', (_: IpcMainInvokeEvent, config: any) => {
        return config
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('update-preferences')
    })
    it('should be updated', async () => {
      await store.dispatch('Preferences/updateTimeline', {
        cw: true,
        nsfw: true,
        hideAllAttachments: true
      })
      expect(store.state.Preferences.general.timeline.cw).toEqual(true)
      expect(store.state.Preferences.general.timeline.nsfw).toEqual(true)
      expect(store.state.Preferences.general.timeline.hideAllAttachments).toEqual(true)
      expect(store.state.Preferences.loading).toEqual(false)
    })
  })
})
