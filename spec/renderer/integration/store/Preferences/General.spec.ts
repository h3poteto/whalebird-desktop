import { createStore, Store } from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import General, { GeneralState } from '@/store/Preferences/General'
import { MyWindow } from '~/src/types/global'
import { IpcMainInvokeEvent } from 'electron'
import { RootState } from '@/store'
;(window as any as MyWindow).ipcRenderer = ipcRenderer

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
        launch: false,
        hideOnLaunch: false
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

const preferencesStore = () => ({
  namespaced: true,
  modules: {
    General: initStore()
  }
})

const app = {
  namespaced: true,
  actions: {
    loadPreferences(_) {
      return true
    }
  }
}

describe('Preferences/General', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        Preferences: preferencesStore(),
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
      await store.dispatch('Preferences/General/loadGeneral')
      expect(store.state.Preferences.General.general.sound.fav_rb).toEqual(false)
      expect(store.state.Preferences.General.general.sound.toot).toEqual(false)
      expect(store.state.Preferences.General.loading).toEqual(false)
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
      await store.dispatch('Preferences/General/updateSound', {
        fav_rb: false,
        toot: false
      })
      expect(store.state.Preferences.General.general.sound.fav_rb).toEqual(false)
      expect(store.state.Preferences.General.general.sound.toot).toEqual(false)
      expect(store.state.Preferences.General.loading).toEqual(false)
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
      await store.dispatch('Preferences/General/updateTimeline', {
        cw: true,
        nsfw: true,
        hideAllAttachments: true
      })
      expect(store.state.Preferences.General.general.timeline.cw).toEqual(true)
      expect(store.state.Preferences.General.general.timeline.nsfw).toEqual(true)
      expect(store.state.Preferences.General.general.timeline.hideAllAttachments).toEqual(true)
      expect(store.state.Preferences.General.loading).toEqual(false)
    })
  })
})
