import generator, { Entity } from 'megalodon'
import SideMenu, { SideMenuState } from './TimelineSpace/SideMenu'
import HeaderMenu, { HeaderMenuState } from './TimelineSpace/HeaderMenu'
import Modals, { ModalsModuleState } from './TimelineSpace/Modals'
import Contents, { ContentsModuleState } from './TimelineSpace/Contents'
import { Module, MutationTree, ActionTree } from 'vuex'
import { LocalAccount } from '~/src/types/localAccount'
import { RootState } from '@/store'
import { AccountLoadError } from '@/errors/load'
import { TimelineFetchError } from '@/errors/fetch'
import { MyWindow } from '~/src/types/global'
import { LocalServer } from '~/src/types/localServer'
import { Setting } from '~/src/types/setting'
import { DefaultSetting } from '~/src/constants/initializer/setting'

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
  FETCH_CONTENTS_TIMELINES: 'fetchContentsTimelines',
  CLEAR_CONTENTS_TIMELINES: 'clearContentsTimelines',
  BIND_STREAMINGS: 'bindStreamings',
  BIND_USER_STREAMING: 'bindUserStreaming',
  BIND_LOCAL_STREAMING: 'bindLocalStreaming',
  BIND_PUBLIC_STREAMING: 'bindPublicStreaming',
  BIND_DIRECT_MESSAGES_STREAMING: 'bindDirectMessagesStreaming',
  UPDATE_TOOT_FOR_ALL_TIMELINES: 'updateTootForAllTimelines',
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
    await dispatch(ACTION_TYPES.FETCH_CONTENTS_TIMELINES).catch(_ => {
      throw new TimelineFetchError()
    })
    return account
  },
  [ACTION_TYPES.PREPARE_SPACE]: async ({ dispatch }) => {
    await dispatch(ACTION_TYPES.BIND_STREAMINGS)
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
  [ACTION_TYPES.WATCH_SHORTCUT_EVENTS]: ({ commit, dispatch, rootGetters }) => {
    win.ipcRenderer.on('CmdOrCtrl+N', () => {
      dispatch('TimelineSpace/Modals/NewToot/openModal', {}, { root: true })
    })
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
  [ACTION_TYPES.FETCH_EMOJIS]: async ({ commit, state }): Promise<Array<Entity.Emoji>> => {
    const client = generator(state.server!.sns, state.server!.baseURL, null, 'Whalebird')
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
    try {
      const client = generator(state.server!.sns, state.server!.baseURL, state.account!.accessToken, rootState.App.userAgent)
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
  [ACTION_TYPES.FETCH_INSTANCE]: async ({ commit, state }) => {
    const client = generator(state.server!.sns, state.server!.baseURL, null, 'Whalebird')
    const res = await client.getInstance()
    if (res.data.max_toot_chars) {
      commit(MUTATION_TYPES.UPDATE_TOOT_MAX, res.data.max_toot_chars)
    }
    if (res.data.configuration) {
      commit(MUTATION_TYPES.UPDATE_TOOT_MAX, res.data.configuration.statuses.max_characters)
    }
    return true
  },
  [ACTION_TYPES.FETCH_CONTENTS_TIMELINES]: async ({ dispatch }) => {
    await dispatch('TimelineSpace/Contents/Notifications/fetchNotifications', {}, { root: true })
    await dispatch('TimelineSpace/Contents/DirectMessages/fetchTimeline', {}, { root: true })
    await dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', {}, { root: true })
    await dispatch('TimelineSpace/Contents/Public/fetchPublicTimeline', {}, { root: true })
  },
  [ACTION_TYPES.CLEAR_CONTENTS_TIMELINES]: ({ commit }) => {
    commit('TimelineSpace/Contents/Local/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/DirectMessages/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/Notifications/clearNotifications', {}, { root: true })
    commit('TimelineSpace/Contents/Public/clearTimeline', {}, { root: true })
  },
  [ACTION_TYPES.BIND_STREAMINGS]: ({ dispatch }) => {
    dispatch('bindUserStreaming')
    dispatch('bindDirectMessagesStreaming')
    dispatch('bindLocalStreaming')
    dispatch('bindPublicStreaming')
  },
  // ------------------------------------------------
  // Each streaming methods
  // ------------------------------------------------
  [ACTION_TYPES.BIND_USER_STREAMING]: async ({ commit, state, rootState }) => {
    if (!state.account) {
      throw new Error('Account is not set')
    }

    win.ipcRenderer.on(`notification-user-streamings-${state.account!.id}`, (_, notification: Entity.Notification) => {
      commit('TimelineSpace/Contents/Notifications/appendNotifications', notification, { root: true })
      if (rootState.TimelineSpace.Contents.Notifications.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Notifications/archiveNotifications', null, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadNotifications', true, { root: true })
    })
    win.ipcRenderer.on(`delete-user-streamings-${state.account!.id}`, (_, id: string) => {
      commit('TimelineSpace/Contents/Home/deleteToot', id, { root: true })
      commit('TimelineSpace/Contents/Notifications/deleteToot', id, { root: true })
    })
  },
  [ACTION_TYPES.BIND_LOCAL_STREAMING]: ({ commit, rootState, state }) => {
    win.ipcRenderer.on(`update-local-streamings-${state.account!.id}`, (_, update: Entity.Status) => {
      commit('TimelineSpace/Contents/Local/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.Local.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Local/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', true, { root: true })
    })
    win.ipcRenderer.on(`delete-local-streamings-${state.account!.id}`, (_, id: string) => {
      commit('TimelineSpace/Contents/Local/deleteToot', id, { root: true })
    })
  },
  [ACTION_TYPES.BIND_PUBLIC_STREAMING]: ({ commit, rootState, state }) => {
    win.ipcRenderer.on(`update-public-streamings-${state.account!.id}`, (_, update: Entity.Status) => {
      commit('TimelineSpace/Contents/Public/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.Public.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Public/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadPublicTimeline', true, { root: true })
    })
    win.ipcRenderer.on(`delete-public-streamings-${state.account!.id}`, (_, id: string) => {
      commit('TimelineSpace/Contents/Public/deleteToot', id, { root: true })
    })
  },
  [ACTION_TYPES.BIND_DIRECT_MESSAGES_STREAMING]: ({ commit, rootState, state }) => {
    win.ipcRenderer.on(`update-direct-streamings-${state.account!.id}`, (_, update: Entity.Status) => {
      commit('TimelineSpace/Contents/DirectMessages/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.DirectMessages.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/DirectMessages/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadDirectMessagesTimeline', true, { root: true })
    })
    win.ipcRenderer.on(`delete-direct-streamings-${state.account!.id}`, (_, id: string) => {
      commit('TimelineSpace/Contents/DirectMessages/deleteToot', id, { root: true })
    })
  },

  [ACTION_TYPES.UPDATE_TOOT_FOR_ALL_TIMELINES]: ({ commit }, status: Entity.Status): boolean => {
    commit('TimelineSpace/Contents/Home/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/Notifications/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/DirectMessages/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/Local/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/Public/updateToot', status, { root: true })
    return true
  }
}

type TimelineSpaceModule = {
  SideMenu: SideMenuState
  HeaderMenu: HeaderMenuState
  Modals: ModalsModuleState
  Contents: ContentsModuleState
}

export type TimelineSpaceModuleState = TimelineSpaceModule & TimelineSpaceState

const TimelineSpace: Module<TimelineSpaceState, RootState> = {
  namespaced: true,
  modules: {
    SideMenu,
    HeaderMenu,
    Modals,
    Contents
  },
  state: state,
  mutations: mutations,
  actions: actions
}

export default TimelineSpace
