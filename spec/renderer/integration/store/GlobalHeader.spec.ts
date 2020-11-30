import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import GlobalHeader, { GlobalHeaderState } from '~/src/renderer/store/GlobalHeader'
import { MyWindow } from '~/src/types/global'
;((window as any) as MyWindow).ipcRenderer = ipcRenderer

const state = (): GlobalHeaderState => {
  return {
    accounts: [],
    changing: false,
    hide: false
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: GlobalHeader.actions,
    mutations: GlobalHeader.mutations
  }
}

const routerState = {
  namespaced: true,
  state: {
    params: {
      id: 'account_id'
    }
  }
}

describe('GlobalHeader', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        GlobalHeader: initStore(),
        route: routerState
      }
    })
  })

  describe('listAccounts', () => {
    beforeEach(() => {
      ipcMain.handle('list-accounts', () => {
        return ['account']
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('list-accounts')
    })
    it('should be updated', async () => {
      await store.dispatch('GlobalHeader/listAccounts')
      expect(store.state.GlobalHeader.accounts).toEqual(['account'])
    })
  })

  describe('refreshAccounts', () => {
    beforeEach(() => {
      ipcMain.handle('refresh-accounts', () => {
        return ['accounts']
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('refresh-accounts')
    })
    it('should be refreshed', async () => {
      await store.dispatch('GlobalHeader/refreshAccounts')
      expect(store.state.GlobalHeader.accounts).toEqual(['accounts'])
    })
  })

  describe('removeShortcutEvents', () => {
    it('should be removed', async () => {
      const removed = await store.dispatch('GlobalHeader/removeShortcutEvents')
      expect(removed).toEqual(true)
    })
  })

  describe('loadHide', () => {
    beforeEach(() => {
      ipcMain.handle('get-global-header', () => {
        return true
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('get-global-header')
    })
    it('should be changed', async () => {
      await store.dispatch('GlobalHeader/loadHide')
      expect(store.state.GlobalHeader.hide).toEqual(true)
    })
  })

  describe('switchHide', () => {
    beforeEach(() => {
      ipcMain.handle('change-global-header', (_, value) => {
        return value
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('change-global-header')
    })
    it('should be switched', async () => {
      const hide = await store.dispatch('GlobalHeader/switchHide', true)
      expect(hide).toEqual(true)
    })
  })
})
