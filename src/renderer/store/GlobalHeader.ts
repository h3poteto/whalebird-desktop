import router from '@/router'
import { LocalAccount } from '~/src/types/localAccount'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LocalServer } from '~src/types/localServer'

const win = (window as any) as MyWindow

export type GlobalHeaderState = {
  accounts: Array<[LocalAccount, LocalServer]>
  changing: boolean
  hide: boolean
}

const state = (): GlobalHeaderState => ({
  accounts: [],
  changing: false,
  hide: false
})

export const MUTATION_TYPES = {
  UPDATE_ACCOUNTS: 'updateAccounts',
  UPDATE_CHANGING: 'updateChanging',
  CHANGE_HIDE: 'changeHide'
}

const mutations: MutationTree<GlobalHeaderState> = {
  [MUTATION_TYPES.UPDATE_ACCOUNTS]: (state: GlobalHeaderState, accounts: Array<[LocalAccount, LocalServer]>) => {
    state.accounts = accounts
  },
  [MUTATION_TYPES.UPDATE_CHANGING]: (state: GlobalHeaderState, value: boolean) => {
    state.changing = value
  },
  [MUTATION_TYPES.CHANGE_HIDE]: (state: GlobalHeaderState, value: boolean) => {
    state.hide = value
  }
}

export const ACTION_TYPES = {
  INIT_LOAD: 'initLoad',
  START_STREAMINGS: 'startStreamings',
  LIST_ACCOUNTS: 'listAccounts',
  WATCH_SHORTCUT_EVENTS: 'watchShortcutEvents',
  REMOVE_SHORTCUT_EVENTS: 'removeShortcutEvents',
  LOAD_HIDE: 'loadHide',
  SWITCH_HIDE: 'switchHide',
  LOAD_TIMELINES: 'loadTimelines',
  BIND_STREAMINGS: 'bindStreamings',
  BIND_NOTIFICATION: 'bindNotification'
}

const actions: ActionTree<GlobalHeaderState, RootState> = {
  [ACTION_TYPES.INIT_LOAD]: async ({ dispatch }): Promise<Array<LocalAccount>> => {
    // Ignore error
    try {
      await dispatch(ACTION_TYPES.REMOVE_SHORTCUT_EVENTS)
      await dispatch(ACTION_TYPES.LOAD_HIDE)
      dispatch(ACTION_TYPES.WATCH_SHORTCUT_EVENTS)
    } catch (err) {
      console.error(err)
    }
    const accounts = await dispatch(ACTION_TYPES.LIST_ACCOUNTS)
    await dispatch(ACTION_TYPES.LOAD_TIMELINES, accounts)
    await dispatch(ACTION_TYPES.BIND_STREAMINGS, accounts)
    // Block to root path when user use browser-back, like mouse button.
    // Because any contents are not rendered when browser back to / from home.
    router.beforeEach((to, from, next) => {
      if (!(to.fullPath === '/' && from.name)) {
        return next()
      }
    })
    return accounts
  },
  [ACTION_TYPES.LIST_ACCOUNTS]: async ({ commit }): Promise<Array<[LocalAccount, LocalServer]>> => {
    const accounts: Array<[LocalAccount, LocalServer]> = await win.ipcRenderer.invoke('list-accounts')
    commit(MUTATION_TYPES.UPDATE_ACCOUNTS, accounts)
    return accounts
  },
  [ACTION_TYPES.WATCH_SHORTCUT_EVENTS]: ({ state, commit, rootState, rootGetters }) => {
    win.ipcRenderer.on('change-account', (_, account: LocalAccount) => {
      if (state.changing) {
        return null
      }
      if ((rootState.route.params.id as string) === account[0].id) {
        return null
      }
      // When the modal window is active, don't change account
      if (rootGetters['TimelineSpace/Modals/modalOpened']) {
        return null
      }
      // changing finish after loading
      commit(MUTATION_TYPES.UPDATE_CHANGING, true)
      router.push(`/${account[0].id}/home`)
      return true
    })
  },
  [ACTION_TYPES.REMOVE_SHORTCUT_EVENTS]: async () => {
    win.ipcRenderer.removeAllListeners('change-account')
    return true
  },
  [ACTION_TYPES.LOAD_HIDE]: async ({ commit }): Promise<boolean> => {
    const hide: boolean = await win.ipcRenderer.invoke('get-global-header')
    commit(MUTATION_TYPES.CHANGE_HIDE, hide)
    return hide
  },
  [ACTION_TYPES.SWITCH_HIDE]: async ({ dispatch }, hide: boolean): Promise<boolean> => {
    await win.ipcRenderer.invoke('change-global-header', hide)
    dispatch(ACTION_TYPES.LOAD_HIDE)
    return true
  },
  [ACTION_TYPES.BIND_NOTIFICATION]: () => {
    win.ipcRenderer.removeAllListeners('open-notification-tab')
    win.ipcRenderer.on('open-notification-tab', (_, id: string) => {
      router.push(`/${id}/home`)
      // We have to wait until change el-menu-item
      setTimeout(() => router.push(`/${id}/notifications`), 500)
    })
  },
  [ACTION_TYPES.LOAD_TIMELINES]: async ({ dispatch }, req: Array<[LocalAccount, LocalServer]>) => {
    req.forEach(async ([account, server]) => {
      await dispatch('TimelineSpace/Contents/Home/fetchTimeline', { account, server }, { root: true })
      await dispatch('TimelineSpace/Contents/Notifications/fetchNotifications', { account, server }, { root: true })
      await dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', { account, server }, { root: true })
      await dispatch('TimelineSpace/Contents/DirectMessages/fetchTimeline', { account, server }, { root: true })
    })
  },
  [ACTION_TYPES.BIND_STREAMINGS]: async ({ commit }, req: Array<[LocalAccount, LocalServer]>) => {
    req.forEach(async ([account, _server]) => {
      win.ipcRenderer.removeAllListeners(`update-user-streamings-${account.id}`)
      win.ipcRenderer.on(`update-user-streamings-${account.id}`, (_, update: Entity.Status) => {
        commit('TimelineSpace/Contents/Home/appendTimeline', { status: update, accountId: account.id }, { root: true })
      })
      win.ipcRenderer.removeAllListeners(`notification-user-streamings-${account.id}`)
      win.ipcRenderer.on(`notification-user-streamings-${account.id}`, (_, notification: Entity.Notification) => {
        commit('TimelineSpace/Contents/Notifications/appendNotifications', { notification, accountId: account.id }, { root: true })
      })
      win.ipcRenderer.removeAllListeners(`delete-user-streamings-${account.id}`)
      win.ipcRenderer.on(`delete-user-streamings-${account.id}`, (_, id: string) => {
        commit('TimelineSpace/Contents/Home/deleteToot', { statusId: id, accountId: account.id }, { root: true })
        commit('TimelineSpace/Contents/Notifications/deleteToot', { statusId: id, accountId: account.id }, { root: true })
      })
      win.ipcRenderer.removeAllListeners(`update-local-streamings-${account.id}`)
      win.ipcRenderer.on(`update-local-streamings-${account.id}`, (_, update: Entity.Status) => {
        commit('TimelineSpace/Contents/Local/appendTimeline', { status: update, accountId: account.id }, { root: true })
      })
      win.ipcRenderer.removeAllListeners(`delete-local-streamings-${account.id}`)
      win.ipcRenderer.on(`delete-local-streamings-${account.id}`, (_, id: string) => {
        commit('TimelineSpace/Contents/Local/deleteToot', { statusId: id, accountId: account.id }, { root: true })
      })
      win.ipcRenderer.removeAllListeners(`update-direct-streamings-${account.id}`)
      win.ipcRenderer.on(`update-direct-streamings-${account.id}`, (_, update: Entity.Status) => {
        commit('TimelineSpace/Contents/DirectMessages/appendTimeline', { status: update, accountId: account.id }, { root: true })
      })
      win.ipcRenderer.removeAllListeners(`delete-direct-streamings-${account.id}`)
      win.ipcRenderer.on(`delete-direct-streamings-${account.id}`, (_, id: string) => {
        commit('TimelineSpace/Contents/DirectMessages/deleteToot', { statusId: id, accountId: account.id }, { root: true })
      })
    })
  }
}

const GlobalHeader: Module<GlobalHeaderState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default GlobalHeader
