import sanitizeHtml from 'sanitize-html'
import { ipcRenderer } from 'electron'
import Mastodon, { Account, Emoji, Instance, Status, Notification as NotificationType } from 'megalodon'
import SideMenu, { SideMenuState } from './TimelineSpace/SideMenu'
import HeaderMenu, { HeaderMenuState } from './TimelineSpace/HeaderMenu'
import Modals, { ModalsModuleState } from './TimelineSpace/Modals'
import Contents, { ContentsModuleState } from './TimelineSpace/Contents'
import router from '@/router'
import unreadSettings from '~/src/constants/unreadNotification'
import { Module, MutationTree, ActionTree } from 'vuex'
import LocalAccount from '~/src/types/localAccount'
import { Notify } from '~/src/types/notify'
import { RootState } from '@/store'
import { UnreadNotification } from '~/src/types/unreadNotification'
import { AccountLoadError } from '@/errors/load'
import { TimelineFetchError } from '@/errors/fetch'

declare var Notification: any

interface MyEmoji {
  name: string
  image: string
}

export interface TimelineSpaceState {
  account: LocalAccount
  loading: boolean
  emojis: Array<MyEmoji>
  tootMax: number
  unreadNotification: UnreadNotification
  useWebsocket: boolean
  pleroma: boolean
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
  loading: false,
  emojis: [],
  tootMax: 500,
  unreadNotification: {
    direct: unreadSettings.Direct.default,
    local: unreadSettings.Local.default,
    public: unreadSettings.Public.default
  },
  useWebsocket: false,
  pleroma: false
})

export const MUTATION_TYPES = {
  UPDATE_ACCOUNT: 'updateAccount',
  CHANGE_LOADING: 'changeLoading',
  UPDATE_EMOJIS: 'updateEmojis',
  UPDATE_TOOT_MAX: 'updateTootMax',
  UPDATE_UNREAD_NOTIFICATION: 'updateUnreadNotification',
  CHANGE_PLEROMA: 'changePleroma',
  CHANGE_USE_WEBSOCKET: 'changeUseWebsocket'
}

const mutations: MutationTree<TimelineSpaceState> = {
  [MUTATION_TYPES.UPDATE_ACCOUNT]: (state, account: LocalAccount) => {
    state.account = account
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, value: boolean) => {
    state.loading = value
  },
  [MUTATION_TYPES.UPDATE_EMOJIS]: (state, emojis: Array<Emoji>) => {
    state.emojis = emojis.map(e => {
      return {
        name: `:${e.shortcode}:`,
        image: e.url
      }
    })
  },
  [MUTATION_TYPES.UPDATE_TOOT_MAX]: (state, value: number | null) => {
    if (value) {
      state.tootMax = value
    } else {
      state.tootMax = 500
    }
  },
  [MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION]: (state, settings: UnreadNotification) => {
    state.unreadNotification = settings
  },
  [MUTATION_TYPES.CHANGE_PLEROMA]: (state, pleroma: boolean) => {
    state.pleroma = pleroma
  },
  [MUTATION_TYPES.CHANGE_USE_WEBSOCKET]: (state, use: boolean) => {
    state.useWebsocket = use
  }
}

const actions: ActionTree<TimelineSpaceState, RootState> = {
  initLoad: async ({ dispatch, commit }, accountId: string): Promise<Account> => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    dispatch('watchShortcutEvents')
    const account = await dispatch('localAccount', accountId).catch(_ => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
      throw new AccountLoadError()
    })

    await dispatch('detectPleroma')
    dispatch('TimelineSpace/SideMenu/fetchLists', account, { root: true })
    dispatch('TimelineSpace/SideMenu/fetchFollowRequests', account, { root: true })
    await dispatch('loadUnreadNotification', accountId)
    commit(MUTATION_TYPES.CHANGE_LOADING, false)
    await dispatch('fetchContentsTimelines', account).catch(_ => {
      throw new TimelineFetchError()
    })
    await dispatch('unbindStreamings')
    await dispatch('bindStreamings', account)
    dispatch('startStreamings', account)
    dispatch('fetchEmojis', account)
    dispatch('fetchInstance', account)
    return account
  },
  // -------------------------------------------------
  // Accounts
  // -------------------------------------------------
  localAccount: async ({ dispatch, commit }, id: string): Promise<LocalAccount> => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-local-account', id)
      ipcRenderer.once('error-get-local-account', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-local-account')
        reject(err)
      })
      ipcRenderer.once('response-get-local-account', (_, account: LocalAccount) => {
        ipcRenderer.removeAllListeners('error-get-local-account')

        if (account.username === undefined || account.username === null || account.username === '') {
          dispatch('fetchAccount', account)
            .then((acct: LocalAccount) => {
              commit(MUTATION_TYPES.UPDATE_ACCOUNT, acct)
              resolve(acct)
            })
            .catch(err => {
              reject(err)
            })
        } else {
          commit(MUTATION_TYPES.UPDATE_ACCOUNT, account)
          resolve(account)
        }
      })
    })
  },
  fetchAccount: (_, account: LocalAccount): Promise<LocalAccount> => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-account', account)
      ipcRenderer.once('error-update-account', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-account')
        reject(err)
      })
      ipcRenderer.once('response-update-account', (_, account: LocalAccount) => {
        ipcRenderer.removeAllListeners('error-update-account')
        resolve(account)
      })
    })
  },
  clearAccount: async ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_ACCOUNT, blankAccount)
    return true
  },
  detectPleroma: async ({ commit, state }) => {
    const res = await Mastodon.get<Instance>('/instance', {}, state.account.baseURL + '/api/v1')
    if (res.data.version.includes('Pleroma')) {
      commit(MUTATION_TYPES.CHANGE_PLEROMA, true)
      commit(MUTATION_TYPES.CHANGE_USE_WEBSOCKET, true)
    } else {
      commit(MUTATION_TYPES.CHANGE_PLEROMA, false)
      commit(MUTATION_TYPES.CHANGE_USE_WEBSOCKET, false)
    }
  },
  // -----------------------------------------------
  // Shortcuts
  // -----------------------------------------------
  watchShortcutEvents: ({ commit, dispatch }) => {
    ipcRenderer.on('CmdOrCtrl+N', () => {
      dispatch('TimelineSpace/Modals/NewToot/openModal', {}, { root: true })
    })
    ipcRenderer.on('CmdOrCtrl+K', () => {
      commit('TimelineSpace/Modals/Jump/changeModal', true, { root: true })
    })
  },
  removeShortcutEvents: async () => {
    ipcRenderer.removeAllListeners('CmdOrCtrl+N')
    ipcRenderer.removeAllListeners('CmdOrCtrl+K')
    return true
  },
  /**
   * clearUnread
   */
  clearUnread: async ({ dispatch }) => {
    dispatch('TimelineSpace/SideMenu/clearUnread', {}, { root: true })
  },
  /**
   * fetchEmojis
   */
  fetchEmojis: async ({ commit }, account: LocalAccount): Promise<Array<Emoji>> => {
    const res = await Mastodon.get<Array<Emoji>>('/custom_emojis', {}, account.baseURL + '/api/v1')
    commit(MUTATION_TYPES.UPDATE_EMOJIS, res.data)
    return res.data
  },
  /**
   * fetchInstance
   */
  fetchInstance: async ({ commit }, account: LocalAccount) => {
    const res = await Mastodon.get<Instance>('/instance', {}, account.baseURL + '/api/v1')
    commit(MUTATION_TYPES.UPDATE_TOOT_MAX, res.data.max_toot_chars)
    return true
  },
  loadUnreadNotification: ({ commit }, accountID: string) => {
    return new Promise(resolve => {
      ipcRenderer.once('response-get-unread-notification', (_, settings: UnreadNotification) => {
        ipcRenderer.removeAllListeners('error-get-unread-notification')
        commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, settings)
        resolve(settings)
      })
      ipcRenderer.once('error-get-unread-notification', () => {
        ipcRenderer.removeAllListeners('response-get-unread-notification')
        commit(MUTATION_TYPES.UPDATE_UNREAD_NOTIFICATION, {
          direct: unreadSettings.Direct.default,
          local: unreadSettings.Local.default,
          public: unreadSettings.Public.default
        } as UnreadNotification)
        resolve({})
      })
      ipcRenderer.send('get-unread-notification', accountID)
    })
  },
  fetchContentsTimelines: async ({ dispatch, state }) => {
    dispatch('TimelineSpace/Contents/changeLoading', true, { root: true })
    await dispatch('TimelineSpace/Contents/Home/fetchTimeline', {}, { root: true }).finally(() => {
      dispatch('TimelineSpace/Contents/changeLoading', false, { root: true })
    })

    await dispatch('TimelineSpace/Contents/Notifications/fetchNotifications', {}, { root: true })
    await dispatch('TimelineSpace/Contents/Mentions/fetchMentions', {}, { root: true })
    if (state.unreadNotification.direct) {
      await dispatch('TimelineSpace/Contents/DirectMessages/fetchTimeline', {}, { root: true })
    }
    if (state.unreadNotification.local) {
      await dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', {}, { root: true })
    }
    if (state.unreadNotification.public) {
      await dispatch('TimelineSpace/Contents/Public/fetchPublicTimeline', {}, { root: true })
    }
  },
  clearContentsTimelines: ({ commit }) => {
    commit('TimelineSpace/Contents/Home/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/Local/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/DirectMessages/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/Notifications/clearNotifications', {}, { root: true })
    commit('TimelineSpace/Contents/Public/clearTimeline', {}, { root: true })
    commit('TimelineSpace/Contents/Mentions/clearMentions', {}, { root: true })
  },
  bindStreamings: ({ dispatch, state }, account: LocalAccount) => {
    dispatch('bindUserStreaming', account)
    if (state.unreadNotification.direct) {
      dispatch('bindDirectMessagesStreaming')
    }
    if (state.unreadNotification.local) {
      dispatch('bindLocalStreaming')
    }
    if (state.unreadNotification.public) {
      dispatch('bindPublicStreaming')
    }
  },
  startStreamings: ({ dispatch, state }) => {
    dispatch('startUserStreaming')
    if (state.unreadNotification.direct) {
      dispatch('startDirectMessagesStreaming')
    }
    if (state.unreadNotification.local) {
      dispatch('startLocalStreaming')
    }
    if (state.unreadNotification.public) {
      dispatch('startPublicStreaming')
    }
  },
  stopStreamings: ({ dispatch }) => {
    dispatch('stopUserStreaming')
    dispatch('stopDirectMessagesStreaming')
    dispatch('stopLocalStreaming')
    dispatch('stopPublicStreaming')
  },
  unbindStreamings: ({ dispatch }) => {
    dispatch('unbindUserStreaming')
    dispatch('unbindDirectMessagesStreaming')
    dispatch('unbindLocalStreaming')
    dispatch('unbindPublicStreaming')
  },
  // ------------------------------------------------
  // Each streaming methods
  // ------------------------------------------------
  bindUserStreaming: ({ commit, rootState }, account: LocalAccount) => {
    ipcRenderer.on('update-start-user-streaming', (_, update: Status) => {
      commit('TimelineSpace/Contents/Home/appendTimeline', update, { root: true })
      // Sometimes archive old statuses
      if (rootState.TimelineSpace.Contents.Home.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Home/archiveTimeline', null, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', true, { root: true })
    })
    ipcRenderer.on('notification-start-user-streaming', (_, notification: NotificationType) => {
      let notify = createNotification(notification, rootState.App.notify as Notify)
      if (notify) {
        notify.onclick = () => {
          router.push(`/${account._id}/notifications`)
        }
      }
      commit('TimelineSpace/Contents/Notifications/appendNotifications', notification, { root: true })
      if (rootState.TimelineSpace.Contents.Notifications.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Notifications/archiveNotifications', null, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadNotifications', true, { root: true })
    })
    ipcRenderer.on('mention-start-user-streaming', (_, mention: NotificationType) => {
      commit('TimelineSpace/Contents/Mentions/appendMentions', mention, { root: true })
      if (rootState.TimelineSpace.Contents.Mentions.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Mentions/archiveMentions', null, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadMentions', true, { root: true })
    })
    ipcRenderer.on('delete-start-user-streaming', (_, id: string) => {
      commit('TimelineSpace/Contents/Home/deleteToot', id, { root: true })
      commit('TimelineSpace/Contents/Notifications/deleteToot', id, { root: true })
      commit('TimelineSpace/Contents/Mentions/deleteToot', id, { root: true })
    })
  },
  startUserStreaming: ({ state }): Promise<{}> => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      ipcRenderer.send('start-user-streaming', {
        account: state.account,
        useWebsocket: state.useWebsocket
      })
      ipcRenderer.once('error-start-user-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  bindLocalStreaming: ({ commit, rootState }) => {
    ipcRenderer.on('update-start-local-streaming', (_, update: Status) => {
      commit('TimelineSpace/Contents/Local/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.Local.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Local/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', true, { root: true })
    })
    ipcRenderer.on('delete-start-local-streaming', (_, id: string) => {
      commit('TimelineSpace/Contents/Local/deleteToot', id, { root: true })
    })
  },
  startLocalStreaming: ({ state }) => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      ipcRenderer.send('start-local-streaming', {
        account: state.account,
        useWebsocket: state.useWebsocket
      })
      ipcRenderer.once('error-start-local-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  bindPublicStreaming: ({ commit, rootState }) => {
    ipcRenderer.on('update-start-public-streaming', (_, update: Status) => {
      commit('TimelineSpace/Contents/Public/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.Public.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/Public/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadPublicTimeline', true, { root: true })
    })
  },
  startPublicStreaming: ({ state }) => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      ipcRenderer.send('start-public-streaming', {
        account: state.account,
        useWebsocket: state.useWebsocket
      })
      ipcRenderer.once('error-start-public-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  bindDirectMessagesStreaming: ({ commit, rootState }) => {
    ipcRenderer.on('update-start-directmessages-streaming', (_, update: Status) => {
      commit('TimelineSpace/Contents/DirectMessages/appendTimeline', update, { root: true })
      if (rootState.TimelineSpace.Contents.DirectMessages.heading && Math.random() > 0.8) {
        commit('TimelineSpace/Contents/DirectMessages/archiveTimeline', {}, { root: true })
      }
      commit('TimelineSpace/SideMenu/changeUnreadDirectMessagesTimeline', true, { root: true })
    })
    ipcRenderer.on('delete-start-directmessages-streaming', (_, id: string) => {
      commit('TimelineSpace/Contents/DirectMessages/deleteToot', id, { root: true })
    })
  },
  startDirectMessagesStreaming: ({ state }) => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      ipcRenderer.send('start-directmessages-streaming', {
        account: state.account,
        useWebsocket: state.useWebsocket
      })
      ipcRenderer.once('error-start-directmessages-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  unbindUserStreaming: () => {
    ipcRenderer.removeAllListeners('update-start-user-streaming')
    ipcRenderer.removeAllListeners('mention-start-user-streaming')
    ipcRenderer.removeAllListeners('notification-start-user-streaming')
    ipcRenderer.removeAllListeners('delete-start-user-streaming')
    ipcRenderer.removeAllListeners('error-start-user-streaming')
  },
  stopUserStreaming: () => {
    ipcRenderer.send('stop-user-streaming')
  },
  unbindLocalStreaming: () => {
    ipcRenderer.removeAllListeners('error-start-local-streaming')
    ipcRenderer.removeAllListeners('update-start-local-streaming')
  },
  stopLocalStreaming: () => {
    ipcRenderer.send('stop-local-streaming')
  },
  unbindPublicStreaming: () => {
    ipcRenderer.removeAllListeners('error-start-public-streaming')
    ipcRenderer.removeAllListeners('update-start-public-streaming')
  },
  stopPublicStreaming: () => {
    ipcRenderer.send('stop-public-streaming')
  },
  unbindDirectMessagesStreaming: () => {
    ipcRenderer.removeAllListeners('error-start-directmessages-streaming')
    ipcRenderer.removeAllListeners('update-start-directmessages-streaming')
  },
  stopDirectMessagesStreaming: () => {
    ipcRenderer.send('stop-directmessages-streaming')
  },
  updateTootForAllTimelines: ({ commit, state }, status: Status): boolean => {
    commit('TimelineSpace/Contents/Home/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/Notifications/updateToot', status, { root: true })
    commit('TimelineSpace/Contents/Mentions/updateToot', status, { root: true })
    if (state.unreadNotification.direct) {
      commit('TimelineSpace/Contents/DirectMessages/updateToot', status, { root: true })
    }
    if (state.unreadNotification.local) {
      commit('TimelineSpace/Contents/Local/updateToot', status, { root: true })
    }
    if (state.unreadNotification.public) {
      commit('TimelineSpace/Contents/Public/updateToot', status, { root: true })
    }
    return true
  }
}

export interface TimelineSpaceModuleState extends TimelineSpaceState {
  SideMenu: SideMenuState
  HeaderMenu: HeaderMenuState
  Modals: ModalsModuleState
  Contents: ContentsModuleState
}

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

function createNotification(notification: NotificationType, notifyConfig: Notify) {
  switch (notification.type) {
    case 'favourite':
      if (notifyConfig.favourite) {
        return new Notification('Favourite', {
          body: `${username(notification.account)} favourited your status`
        })
      }
      break
    case 'follow':
      if (notifyConfig.follow) {
        return new Notification('Follow', {
          body: `${username(notification.account)} is now following you`
        })
      }
      break
    case 'mention':
      if (notifyConfig.reply) {
        // Clean html tags
        return new Notification(`${notification.status!.account.display_name}`, {
          body: sanitizeHtml(notification.status!.content, {
            allowedTags: [],
            allowedAttributes: []
          })
        })
      }
      break
    case 'reblog':
      if (notifyConfig.reblog) {
        return new Notification('Reblog', {
          body: `${username(notification.account)} boosted your status`
        })
      }
      break
  }
}

function username(account: Account) {
  if (account.display_name !== '') {
    return account.display_name
  } else {
    return account.username
  }
}
