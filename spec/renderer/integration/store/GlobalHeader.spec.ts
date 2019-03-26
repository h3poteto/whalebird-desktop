import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import GlobalHeader from '~/src/renderer/store/GlobalHeader'

const state = () => {
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
      ipcMain.once('list-accounts', (event, _) => {
        event.sender.send('response-list-accounts', ['account'])
      })
    })
    it('should be updated', async () => {
      await store.dispatch('GlobalHeader/listAccounts')
      expect(store.state.GlobalHeader.accounts).toEqual(['account'])
    })
  })

  describe('refreshAccounts', () => {
    beforeEach(() => {
      ipcMain.once('refresh-accounts', (event, _) => {
        event.sender.send('response-refresh-accounts', ['accounts'])
      })
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
      ipcMain.once('get-global-header', (event, _) => {
        event.sender.send('response-get-global-header', true)
      })
    })
    it('should be changed', async () => {
      await store.dispatch('GlobalHeader/loadHide')
      expect(store.state.GlobalHeader.hide).toEqual(true)
    })
  })

  describe('switchHide', () => {
    beforeEach(() => {
      ipcMain.once('change-global-header', (event, value) => {
        event.sender.send('response-change-global-header', value)
      })
    })
    it('should be switched', async () => {
      const hide = await store.dispatch('GlobalHeader/switchHide', true)
      expect(hide).toEqual(true)
    })
  })
})
