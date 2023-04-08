import generator, { Entity } from 'megalodon'
import SideMenu, { SideMenuState } from './TimelineSpace/SideMenu'
import HeaderMenu, { HeaderMenuState } from './TimelineSpace/HeaderMenu'
import Modals, { ModalsModuleState } from './TimelineSpace/Modals'
import Contents, { ContentsModuleState } from './TimelineSpace/Contents'
import { Module, MutationTree, ActionTree } from 'vuex'
import { LocalAccount } from '~/src/types/localAccount'
import { RootState } from '@/store'
import { AccountLoadError } from '@/errors/load'
import { MyWindow } from '~/src/types/global'
import { LocalServer } from '~/src/types/localServer'
import { Setting } from '~/src/types/setting'
import { DefaultSetting } from '~/src/constants/initializer/setting'
import Compose, { ComposeState } from './TimelineSpace/Compose'

const win = (window as any) as MyWindow

export type TimelineSpaceState = {
  account: LocalAccount | null
  server: LocalServer | null
  loading: boolean
  emojis: Array<Entity.Emoji>
  tootMax: number
  filters: Array<Entity.Filter>
  setting: Setting
}

const state = (): TimelineSpaceState => ({
  account: null,
  server: null,
  loading: false,
  emojis: [],
  tootMax: 500,
  filters: [],
  setting: DefaultSetting
})

export const MUTATION_TYPES = {
  UPDATE_ACCOUNT: 'updateAccount',
  UPDATE_SERVER: 'updateServer',
  CHANGE_LOADING: 'changeLoading',
  UPDATE_EMOJIS: 'updateEmojis',
  UPDATE_TOOT_MAX: 'updateTootMax',
  UPDATE_FILTERS: 'updateFilters',
  UPDATE_SETTING: 'updateSetting'
}

const mutations: MutationTree<TimelineSpaceState> = {
  [MUTATION_TYPES.UPDATE_ACCOUNT]: (state, account: LocalAccount) => {
    state.account = account
  },
  [MUTATION_TYPES.UPDATE_SERVER]: (state, server: LocalServer) => {
    state.server = server
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, value: boolean) => {
    state.loading = value
  },
  [MUTATION_TYPES.UPDATE_EMOJIS]: (state, emojis: Array<Entity.Emoji>) => {
    state.emojis = emojis
  },
  [MUTATION_TYPES.UPDATE_TOOT_MAX]: (state, value: number | null) => {
    if (value) {
      state.tootMax = value
    } else {
      state.tootMax = 500
    }
  },
  [MUTATION_TYPES.UPDATE_FILTERS]: (state, filters: Array<Entity.Filter>) => {
    state.filters = filters
  },
  [MUTATION_TYPES.UPDATE_SETTING]: (state, setting: Setting) => {
    state.setting = setting
  }
}

export const ACTION_TYPES = {
  INIT_LOAD: 'initLoad',
  PREPARE_SPACE: 'prepareSpace',
  LOCAL_ACCOUNT: 'localAccount',
  CLEAR_ACCOUNT: 'clearAccount',
  WATCH_SHORTCUT_EVENTS: 'watchShortcutEvents',
  REMOVE_SHORTCUT_EVENTS: 'removeShortcutEvents',
  CLEAR_UNREAD: 'clearUnread',
  FETCH_EMOJIS: 'fetchEmojis',
  FETCH_FILTERS: 'fetchFilters',
  FETCH_INSTANCE: 'fetchInstance',
  LOAD_SETTING: 'loadSetting'
}

const actions: ActionTree<TimelineSpaceState, RootState> = {
  [ACTION_TYPES.INIT_LOAD]: async ({ dispatch, commit }, accountId: string): Promise<[LocalAccount, LocalServer]> => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    dispatch(ACTION_TYPES.WATCH_SHORTCUT_EVENTS)
    const account: [LocalAccount, LocalServer] = await dispatch(ACTION_TYPES.LOCAL_ACCOUNT, accountId).catch(_ => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
      throw new AccountLoadError()
    })

    await dispatch(ACTION_TYPES.LOAD_SETTING)
    await dispatch(ACTION_TYPES.FETCH_FILTERS)
    commit(MUTATION_TYPES.CHANGE_LOADING, false)
    return account
  },
  [ACTION_TYPES.PREPARE_SPACE]: async ({ dispatch }) => {
    await dispatch(ACTION_TYPES.FETCH_EMOJIS)
    await dispatch(ACTION_TYPES.FETCH_INSTANCE)
  },
  // -------------------------------------------------
  // Accounts
  // -------------------------------------------------
  [ACTION_TYPES.LOCAL_ACCOUNT]: async ({ commit }, id: number): Promise<[LocalAccount, LocalServer]> => {
    const account: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id)
    commit(MUTATION_TYPES.UPDATE_ACCOUNT, account[0])
    commit(MUTATION_TYPES.UPDATE_SERVER, account[1])
    return account
  },
  [ACTION_TYPES.CLEAR_ACCOUNT]: async ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_ACCOUNT, null)
    return true
  },
  // -----------------------------------------------
  // Shortcuts
  // -----------------------------------------------
  [ACTION_TYPES.WATCH_SHORTCUT_EVENTS]: ({ commit, rootGetters }) => {
    win.ipcRenderer.on('CmdOrCtrl+K', () => {
      commit('TimelineSpace/Modals/Jump/changeModal', true, { root: true })
    })
    win.ipcRenderer.on('open-shortcuts-list', () => {
      const modalOpened = rootGetters['TimelineSpace/Modals/modalOpened']
      if (!modalOpened) {
        commit('TimelineSpace/Modals/Shortcut/changeModal', true, { root: true })
      }
    })
  },
  [ACTION_TYPES.REMOVE_SHORTCUT_EVENTS]: async () => {
    win.ipcRenderer.removeAllListeners('CmdOrCtrl+N')
    win.ipcRenderer.removeAllListeners('CmdOrCtrl+K')
    return true
  },
  /**
   * clearUnread
   */
  [ACTION_TYPES.CLEAR_UNREAD]: async ({ dispatch }) => {
    dispatch('TimelineSpace/SideMenu/clearUnread', {}, { root: true })
  },
  /**
   * fetchEmojis
   */
  [ACTION_TYPES.FETCH_EMOJIS]: async ({ commit, state, rootState }): Promise<Array<Entity.Emoji>> => {
    if (!state.server) {
      return []
    }
    const client = generator(state.server.sns, state.server.baseURL, null, rootState.App.userAgent)
    const res = await client.getInstanceCustomEmojis()
    commit(MUTATION_TYPES.UPDATE_EMOJIS, res.data)
    return res.data
  },
  [ACTION_TYPES.LOAD_SETTING]: async ({ commit, state }) => {
    const setting: Setting = await win.ipcRenderer.invoke('get-account-setting', state.account!.id)
    commit(MUTATION_TYPES.UPDATE_SETTING, setting)
  },
  /**
   * fetchFilters
   */
  [ACTION_TYPES.FETCH_FILTERS]: async ({ commit, state, rootState }): Promise<Array<Entity.Filter>> => {
    if (!state.server || !state.account) {
      return []
    }
    try {
      const client = generator(state.server.sns, state.server.baseURL, state.account.accessToken, rootState.App.userAgent)
      const res = await client.getFilters()
      commit(MUTATION_TYPES.UPDATE_FILTERS, res.data)
      return res.data
    } catch {
      return []
    }
  },
  /**
   * fetchInstance
   */
  [ACTION_TYPES.FETCH_INSTANCE]: async ({ commit, state, rootState }) => {
    if (!state.server) {
      return false
    }
    const client = generator(state.server.sns, state.server.baseURL, null, rootState.App.userAgent)
    const res = await client.getInstance()
    if (res.data.configuration) {
      commit(MUTATION_TYPES.UPDATE_TOOT_MAX, res.data.configuration.statuses.max_characters)
    }
    return true
  }
}

type TimelineSpaceModule = {
  SideMenu: SideMenuState
  HeaderMenu: HeaderMenuState
  Modals: ModalsModuleState
  Contents: ContentsModuleState
  Compose: ComposeState
}

export type TimelineSpaceModuleState = TimelineSpaceModule & TimelineSpaceState

const TimelineSpace: Module<TimelineSpaceState, RootState> = {
  namespaced: true,
  modules: {
    SideMenu,
    HeaderMenu,
    Modals,
    Contents,
    Compose
  },
  state: state,
  mutations: mutations,
  actions: actions
}

export default TimelineSpace
