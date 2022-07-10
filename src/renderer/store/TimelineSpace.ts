import generator, { detector, Entity } from 'megalodon'
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
import { Timeline, Setting } from '~src/types/setting'
import { DefaultSetting } from '~/src/constants/initializer/setting'

const win = window as any as MyWindow

export type TimelineSpaceState = {
  account: LocalAccount
  bindingAccount: LocalAccount | null
  loading: boolean
  emojis: Array<Entity.Emoji>
  tootMax: number
  timelineSetting: Timeline
  sns: 'mastodon' | 'pleroma' | 'misskey'
  filters: Array<Entity.Filter>
}

export const blankAccount: LocalAccount = {
  _id: '',
  baseURL: '',
  domain: '',
  username: '',
  clientId: '',
  clientSecret: '',
  accessToken: null,
  refreshToken: null,
  accountId: null,
  avatar: null,
  order: 0
}

const state = (): TimelineSpaceState => ({
  account: blankAccount,
  bindingAccount: null,
  loading: false,
  emojis: [],
  tootMax: 500,
  timelineSetting: DefaultSetting.timeline,
  sns: 'mastodon',
  filters: []
})

export const MUTATION_TYPES = {
  UPDATE_ACCOUNT: 'updateAccount',
  UPDATE_BINDING_ACCOUNT: 'updateBindingAccount',
  CHANGE_LOADING: 'changeLoading',
  UPDATE_EMOJIS: 'updateEmojis',
  UPDATE_TOOT_MAX: 'updateTootMax',
  UPDATE_TIMELINE_SETTING: 'updateTimelineSetting',
  CHANGE_SNS: 'changeSNS',
  UPDATE_FILTERS: 'updateFilters'
}

const mutations: MutationTree<TimelineSpaceState> = {
  [MUTATION_TYPES.UPDATE_ACCOUNT]: (state, account: LocalAccount) => {
    state.account = account
  },
  [MUTATION_TYPES.UPDATE_BINDING_ACCOUNT]: (state, account: LocalAccount) => {
    state.bindingAccount = account
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
  [MUTATION_TYPES.UPDATE_TIMELINE_SETTING]: (state, setting: Timeline) => {
    state.timelineSetting = setting
  },
  [MUTATION_TYPES.CHANGE_SNS]: (state, sns: 'mastodon' | 'pleroma' | 'misskey') => {
    state.sns = sns
  },
  [MUTATION_TYPES.UPDATE_FILTERS]: (state, filters: Array<Entity.Filter>) => {
    state.filters = filters
  }
}

export const ACTION_TYPES = {
  INIT_LOAD: 'initLoad',
  PREPARE_SPACE: 'prepareSpace',
  LOCAL_ACCOUNT: 'localAccount',
  FETCH_ACCOUNT: 'fetchAccount',
  CLEAR_ACCOUNT: 'clearAccount',
  DETECT_SNS: 'detectSNS',
  WATCH_SHORTCUT_EVENTS: 'watchShortcutEvents',
  REMOVE_SHORTCUT_EVENTS: 'removeShortcutEvents',
  CLEAR_UNREAD: 'clearUnread',
  FETCH_EMOJIS: 'fetchEmojis',
  FETCH_FILTERS: 'fetchFilters',
  FETCH_INSTANCE: 'fetchInstance',
  LOAD_TIMELINE_SETTING: 'loadTimelineSetting',
  FETCH_CONTENTS_TIMELINES: 'fetchContentsTimelines',
  CLEAR_CONTENTS_TIMELINES: 'clearContentsTimelines',
  BIND_STREAMINGS: 'bindStreamings',
  START_STREAMINGS: 'startStreamings',
  STOP_STREAMINGS: 'stopStreamings',
  UNBIND_STREAMINGS: 'unbindStreamings',
  BIND_USER_STREAMING: 'bindUserStreaming',
  BIND_LOCAL_STREAMING: 'bindLocalStreaming',
  START_LOCAL_STREAMING: 'startLocalStreaming',
  BIND_PUBLIC_STREAMING: 'bindPublicStreaming',
  START_PUBLIC_STREAMING: 'startPublicStreaming',
  BIND_DIRECT_MESSAGES_STREAMING: 'bindDirectMessagesStreaming',
  START_DIRECT_MESSAGES_STREAMING: 'startDirectMessagesStreaming',
  UNBIND_USER_STREAMING: 'unbindUserStreaming',
  UNBIND_LOCAL_STREAMING: 'unbindLocalStreaming',
  STOP_LOCAL_STREAMING: 'stopLocalStreaming',
  UNBIND_PUBLIC_STREAMING: 'unbindPublicStreaming',
  STOP_PUBLIC_STREAMING: 'stopPublicStreaming',
  UNBIND_DIRECT_MESSAGES_STREAMING: 'unbindDirectMessagesStreaming',
  STOP_DIRECT_MESSAGES_STREAMING: 'stopDirectMessagesStreaming',
  UPDATE_TOOT_FOR_ALL_TIMELINES: 'updateTootForAllTimelines',
  WAIT_TO_UNBIND_USER_STREAMING: 'waitToUnbindUserStreaming'
}

const actions: ActionTree<TimelineSpaceState, RootState> = {
  [ACTION_TYPES.INIT_LOAD]: async ({ dispatch, commit }, accountId: string): Promise<LocalAccount> => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    dispatch('watchShortcutEvents')
    const account: LocalAccount = await dispatch('localAccount', accountId).catch(_ => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
      throw new AccountLoadError()
    })

    await dispatch('detectSNS')
    dispatch('TimelineSpace/SideMenu/fetchLists', account, { root: true })
    dispatch('TimelineSpace/SideMenu/fetchFollowRequests', account, { root: true })
    dispatch('TimelineSpace/SideMenu/confirmTimelines', account, { root: true })
    await dispatch('loadTimelineSetting', accountId)
    await dispatch('fetchFilters')
    commit(MUTATION_TYPES.CHANGE_LOADING, false)
    await dispatch('fetchContentsTimelines').catch(_ => {
      throw new TimelineFetchError()
    })
    return account
  },
  [ACTION_TYPES.PREPARE_SPACE]: async ({ state, dispatch }) => {
    await dispatch('bindStreamings')
    dispatch('startStreamings')
    await dispatch('fetchEmojis', state.account)
    await dispatch('fetchInstance', state.account)
    // // Backup current account information.
    // commit(MUTATION_TYPES.UPDATE_PREVIOUS_ACCOUNT, state.account)
  },
  // -------------------------------------------------
  // Accounts
  // -------------------------------------------------
  [ACTION_TYPES.LOCAL_ACCOUNT]: async ({ dispatch, commit }, id: string): Promise<LocalAccount> => {
    const account: LocalAccount = await win.ipcRenderer.invoke('get-local-account', id)
    if (account.username === undefined || account.username === null || account.username === '') {
      const acct: LocalAccount = await dispatch('fetchAccount', account)
      commit(MUTATION_TYPES.UPDATE_ACCOUNT, acct)
      return acct
    } else {
      commit(MUTATION_TYPES.UPDATE_ACCOUNT, account)
      return account
    }
  },
  [ACTION_TYPES.FETCH_ACCOUNT]: async (_, account: LocalAccount): Promise<LocalAccount> => {
    const acct: LocalAccount = await win.ipcRenderer.invoke('update-account', account)
    return acct
  },
  [ACTION_TYPES.CLEAR_ACCOUNT]: async ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_ACCOUNT, blankAccount)
    return true
  },
  [ACTION_TYPES.DETECT_SNS]: async ({ commit, state }) => {
    const sns = await detector(state.account.baseURL)
    commit(MUTATION_TYPES.CHANGE_SNS, sns)
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
  [ACTION_TYPES.FETCH_EMOJIS]: async ({ commit, state }, account: LocalAccount): Promise<Array<Entity.Emoji>> => {
    const client = generator(state.sns, account.baseURL, null, 'Whalebird')
    const res = await client.getInstanceCustomEmojis()
    commit(MUTATION_TYPES.UPDATE_EMOJIS, res.data)
    return res.data
  },
  /**
   * fetchFilters
   */
  [ACTION_TYPES.FETCH_FILTERS]: async ({ commit, state, rootState }): Promise<Array<Entity.Filter>> => {
    try {
      const client = generator(state.sns, state.account.baseURL, state.account.accessToken, rootState.App.userAgent)
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
  [ACTION_TYPES.FETCH_INSTANCE]: async ({ commit, state }, account: LocalAccount) => {
    const client = generator(state.sns, account.baseURL, null, 'Whalebird')
    const res = await client.getInstance()
    commit(MUTATION_TYPES.UPDATE_TOOT_MAX, res.data.max_toot_chars)
    return true
  },
  [ACTION_TYPES.LOAD_TIMELINE_SETTING]: async ({ commit }, accountID: string) => {
    const setting: Setting = await win.ipcRenderer.invoke('get-account-setting', accountID)
    commit(MUTATION_TYPES.UPDATE_TIMELINE_SETTING, setting.timeline)
  },
  [ACTION_TYPES.FETCH_CONTENTS_TIMELINES]: async ({ dispatch, state }) => {
    dispatch('TimelineSpace/Contents/changeLoading', true, { root: true })
    await dispatch('TimelineSpace/Contents/Home/fetchTimeline', {}, { root: true }).finally(() => {
      dispatch('TimelineSpace/Contents/changeLoading', false, { root: true })
    })

    await dispatch('TimelineSpace/Contents/Notifications/fetchNotifications', {}, { root: true })
    await dispatch('TimelineSpace/Contents/Mentions/fetchMentions', {}, { root: true })
    if (state.timelineSetting.unreadNotification.direct) {
      await dispatch('TimelineSpace/Contents/DirectMessages/fetchTimeline', {}, { root: true })
    }
    if (state.timelineSetting.unreadNotification.local) {
      await dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', {}, { root: true })
    }
    if (state.timelineSetting.unreadNotification.public) {
      await dispatch('TimelineSpace/Contents/Public/fetchPublicTimeline', {}, { root: true })
    }
  },
  [ACTION_TYPES.CLEAR_CONTENTS_TIMELINES]: ({ commit }) => {
    commit('TimelineSpace/Contents/Home/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/Local/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/DirectMessages/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/Notifications/clearNotifications', {}, { root: true })
    commit('TimelineSpace/Contents/Public/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/Mentions/clearMentions', {}, { root: true })
  },
  [ACTION_TYPES.BIND_STREAMINGS]: ({ dispatch, state }) => {
    dispatch('bindUserStreaming')
    if (state.timelineSetting.unreadNotification.direct) {
      dispatch('bindDirectMessagesStreaming')
    }
    if (state.timelineSetting.unreadNotification.local) {
      dispatch('bindLocalStreaming')
    }
    if (state.timelineSetting.unreadNotification.public) {
      dispatch('bindPublicStreaming')
    }
  },
  [ACTION_TYPES.START_STREAMINGS]: ({ dispatch, state }) => {
    if (state.timelineSetting.unreadNotification.direct) {
      dispatch('startDirectMessagesStreaming')
    }
    if (state.timelineSetting.unreadNotification.local) {
      dispatch('startLocalStreaming')
    }
    if (state.timelineSetting.unreadNotification.public) {
      dispatch('startPublicStreaming')
    }
  },
  [ACTION_TYPES.STOP_STREAMINGS]: ({ dispatch }) => {
    dispatch('stopDirectMessagesStreaming')
    dispatch('stopLocalStreaming')
    dispatch('stopPublicStreaming')
  },
  [ACTION_TYPES.UNBIND_STREAMINGS]: ({ dispatch }) => {
    dispatch('unbindUserStreaming')
    dispatch('unbindDirectMessagesStreaming')
    dispatch('unbindLocalStreaming')
    dispatch('unbindPublicStreaming')
  },
  // ------------------------------------------------
  // Each streaming methods
  // ------------------------------------------------
  [ACTION_TYPES.BIND_USER_STREAMING]: async ({ commit, state, rootState, dispatch }) => {
    if (!state.account._id) {
      throw new Error('Account is not set')
    }
    // We have to wait to unbind previous streaming.
    await dispatch('waitToUnbindUserStreaming')

    commit(MUTATION_TYPES.UPDATE_BINDING_ACCOUNT, state.account)
    win.ipcRenderer.on(`update-start-all-user-streamings-${state.account._id!}`, (_, update: Entity.Status) => {
      commit('TimelineSpace/Contents/Home/appendTimeline', update, { root: true })
      // Sometimes archive old statuses
      if (rootState.TimelineSpace.Contents.Home.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Home/archiveTimeline', null, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', true, { root: true })
    })
    win.ipcRenderer.on(`notification-start-all-user-streamings-${state.account._id!}`, (_, notification: Entity.Notification) => {
      commit('TimelineSpace/Contents/Notifications/appendNotifications', notification, { root: true })
      if (rootState.TimelineSpace.Contents.Notifications.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Notifications/archiveNotifications', null, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadNotifications', true, { root: true })
    })
    win.ipcRenderer.on(`mention-start-all-user-streamings-${state.account._id!}`, (_, mention: Entity.Notification) => {
      commit('TimelineSpace/Contents/Mentions/appendMentions', mention, { root: true })
      if (rootState.TimelineSpace.Contents.Mentions.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Mentions/archiveMentions', null, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadMentions', true, { root: true })
    })
    win.ipcRenderer.on(`delete-start-all-user-streamings-${state.account._id!}`, (_, id: string) => {
      commit('TimelineSpace/Contents/Home/deleteToot', id, { root: true })
      commit('TimelineSpace/Contents/Notifications/deleteToot', id, { root: true })
      commit('TimelineSpace/Contents/Mentions/deleteToot', id, { root: true })
    })
  },
  [ACTION_TYPES.BIND_LOCAL_STREAMING]: ({ commit, rootState }) => {
    win.ipcRenderer.on('update-start-local-streaming', (_, update: Entity.Status) => {
      commit('TimelineSpace/Contents/Local/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.Local.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Local/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', true, { root: true })
    })
    win.ipcRenderer.on('delete-start-local-streaming', (_, id: string) => {
      commit('TimelineSpace/Contents/Local/deleteToot', id, { root: true })
    })
  },
  [ACTION_TYPES.START_LOCAL_STREAMING]: ({ state }) => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      win.ipcRenderer.send('start-local-streaming', state.account._id)
      win.ipcRenderer.once('error-start-local-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  [ACTION_TYPES.BIND_PUBLIC_STREAMING]: ({ commit, rootState }) => {
    win.ipcRenderer.on('update-start-public-streaming', (_, update: Entity.Status) => {
      commit('TimelineSpace/Contents/Public/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.Public.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Public/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadPublicTimeline', true, { root: true })
    })
    win.ipcRenderer.on('delete-start-public-streaming', (_, id: string) => {
      commit('TimelineSpace/Contents/Public/deleteToot', id, { root: true })
    })
  },
  [ACTION_TYPES.START_PUBLIC_STREAMING]: ({ state }) => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      win.ipcRenderer.send('start-public-streaming', state.account._id)
      win.ipcRenderer.once('error-start-public-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  [ACTION_TYPES.BIND_DIRECT_MESSAGES_STREAMING]: ({ commit, rootState }) => {
    win.ipcRenderer.on('update-start-directmessages-streaming', (_, update: Entity.Status) => {
      commit('TimelineSpace/Contents/DirectMessages/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.DirectMessages.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/DirectMessages/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadDirectMessagesTimeline', true, { root: true })
    })
    win.ipcRenderer.on('delete-start-directmessages-streaming', (_, id: string) => {
      commit('TimelineSpace/Contents/DirectMessages/deleteToot', id, { root: true })
    })
  },
  [ACTION_TYPES.START_DIRECT_MESSAGES_STREAMING]: ({ state }) => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      win.ipcRenderer.send('start-directmessages-streaming', state.account._id)
      win.ipcRenderer.once('error-start-directmessages-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  [ACTION_TYPES.UNBIND_USER_STREAMING]: ({ state, commit }) => {
    // When unbind is called, sometimes account is already cleared and account does not have _id.
    // So we have to get previous account to unbind streamings.
    if (state.bindingAccount) {
      win.ipcRenderer.removeAllListeners(`update-start-all-user-streamings-${state.bindingAccount._id!}`)
      win.ipcRenderer.removeAllListeners(`mention-start-all-user-streamings-${state.bindingAccount._id!}`)
      win.ipcRenderer.removeAllListeners(`notification-start-all-user-streamings-${state.bindingAccount._id!}`)
      win.ipcRenderer.removeAllListeners(`delete-start-all-user-streamings-${state.bindingAccount._id!}`)
      // And we have to clear binding account after unbind.
      commit(MUTATION_TYPES.UPDATE_BINDING_ACCOUNT, null)
    } else {
      console.info('binding account does not exist')
    }
  },
  [ACTION_TYPES.UNBIND_LOCAL_STREAMING]: () => {
    win.ipcRenderer.removeAllListeners('error-start-local-streaming')
    win.ipcRenderer.removeAllListeners('update-start-local-streaming')
    win.ipcRenderer.removeAllListeners('delete-start-local-streaming')
  },
  [ACTION_TYPES.STOP_LOCAL_STREAMING]: () => {
    win.ipcRenderer.send('stop-local-streaming')
  },
  [ACTION_TYPES.UNBIND_PUBLIC_STREAMING]: () => {
    win.ipcRenderer.removeAllListeners('error-start-public-streaming')
    win.ipcRenderer.removeAllListeners('update-start-public-streaming')
    win.ipcRenderer.removeAllListeners('delete-start-public-streaming')
  },
  [ACTION_TYPES.STOP_PUBLIC_STREAMING]: () => {
    win.ipcRenderer.send('stop-public-streaming')
  },
  [ACTION_TYPES.UNBIND_DIRECT_MESSAGES_STREAMING]: () => {
    win.ipcRenderer.removeAllListeners('error-start-directmessages-streaming')
    win.ipcRenderer.removeAllListeners('update-start-directmessages-streaming')
    win.ipcRenderer.removeAllListeners('delete-start-directmessages-streaming')
  },
  [ACTION_TYPES.STOP_DIRECT_MESSAGES_STREAMING]: () => {
    win.ipcRenderer.send('stop-directmessages-streaming')
  },
  [ACTION_TYPES.UPDATE_TOOT_FOR_ALL_TIMELINES]: ({ commit, state }, status: Entity.Status): boolean => {
    commit('TimelineSpace/Contents/Home/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/Notifications/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/Mentions/updateToot', status, { root: true })
    if (state.timelineSetting.unreadNotification.direct) {
      commit('TimelineSpace/Contents/DirectMessages/updateToot', status, { root: true })
    }
    if (state.timelineSetting.unreadNotification.local) {
      commit('TimelineSpace/Contents/Local/updateToot', status, { root: true })
    }
    if (state.timelineSetting.unreadNotification.public) {
      commit('TimelineSpace/Contents/Public/updateToot', status, { root: true })
    }
    return true
  },
  [ACTION_TYPES.WAIT_TO_UNBIND_USER_STREAMING]: async ({ state, dispatch }): Promise<boolean> => {
    if (!state.bindingAccount) {
      return true
    }
    dispatch('unbindUserStreaming')
    await sleep(500)
    const res: boolean = await dispatch('waitToUnbindUserStreaming')
    return res
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

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec))
