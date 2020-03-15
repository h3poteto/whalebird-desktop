import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { LocalTag } from '~/src/types/localTag'
import { LocalAccount } from '~/src/types/localAccount'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type SideMenuState = {
  unreadHomeTimeline: boolean
  unreadNotifications: boolean
  unreadMentions: boolean
  unreadLocalTimeline: boolean
  unreadDirectMessagesTimeline: boolean
  unreadPublicTimeline: boolean
  unreadFollowRequests: boolean
  lists: Array<Entity.List>
  tags: Array<LocalTag>
  collapse: boolean
}

const state = (): SideMenuState => ({
  unreadHomeTimeline: false,
  unreadNotifications: false,
  unreadMentions: false,
  unreadLocalTimeline: false,
  unreadDirectMessagesTimeline: false,
  unreadPublicTimeline: false,
  unreadFollowRequests: false,
  lists: [],
  tags: [],
  collapse: false
})

export const MUTATION_TYPES = {
  CHANGE_UNREAD_HOME_TIMELINE: 'changeUnreadHomeTimeline',
  CHANGE_UNREAD_NOTIFICATIONS: 'changeUnreadNotifications',
  CHANGE_UNREAD_MENTIONS: 'changeUnreadMentions',
  CHANGE_UNREAD_LOCAL_TIMELINE: 'changeUnreadLocalTimeline',
  CHANGE_UNREAD_DIRECT_MESSAGES_TIMELINE: 'changeUnreadDirectMessagesTimeline',
  CHANGE_UNREAD_PUBLIC_TIMELINE: 'changeUnreadPublicTimeline',
  CHANGE_UNREAD_FOLLOW_REQUESTS: 'changeUnreadFollowRequests',
  UPDATE_LISTS: 'updateLists',
  CHANGE_COLLAPSE: 'changeCollapse',
  UPDATE_TAGS: 'updateTags'
}

const mutations: MutationTree<SideMenuState> = {
  [MUTATION_TYPES.CHANGE_UNREAD_HOME_TIMELINE]: (state, value: boolean) => {
    state.unreadHomeTimeline = value
  },
  [MUTATION_TYPES.CHANGE_UNREAD_NOTIFICATIONS]: (state, value: boolean) => {
    state.unreadNotifications = value
  },
  [MUTATION_TYPES.CHANGE_UNREAD_MENTIONS]: (state, value: boolean) => {
    state.unreadMentions = value
  },
  [MUTATION_TYPES.CHANGE_UNREAD_LOCAL_TIMELINE]: (state, value: boolean) => {
    state.unreadLocalTimeline = value
  },
  [MUTATION_TYPES.CHANGE_UNREAD_DIRECT_MESSAGES_TIMELINE]: (state, value: boolean) => {
    state.unreadDirectMessagesTimeline = value
  },
  [MUTATION_TYPES.CHANGE_UNREAD_PUBLIC_TIMELINE]: (state, value: boolean) => {
    state.unreadPublicTimeline = value
  },
  [MUTATION_TYPES.CHANGE_UNREAD_FOLLOW_REQUESTS]: (state, value: boolean) => {
    state.unreadFollowRequests = value
  },
  [MUTATION_TYPES.UPDATE_LISTS]: (state, lists: Array<Entity.List>) => {
    state.lists = lists
  },
  [MUTATION_TYPES.CHANGE_COLLAPSE]: (state, collapse: boolean) => {
    state.collapse = collapse
  },
  [MUTATION_TYPES.UPDATE_TAGS]: (state, tags: Array<LocalTag>) => {
    state.tags = tags
  }
}

const actions: ActionTree<SideMenuState, RootState> = {
  fetchLists: async ({ commit, rootState }, account: LocalAccount | null = null): Promise<Array<Entity.List>> => {
    if (account === null) account = rootState.TimelineSpace.account
    const client = generator(
      rootState.TimelineSpace.sns,
      account.baseURL,
      account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getLists()
    commit(MUTATION_TYPES.UPDATE_LISTS, res.data)
    return res.data
  },
  fetchFollowRequests: async ({ commit, rootState }, account: LocalAccount | null = null): Promise<Array<Entity.Account>> => {
    if (account === null) account = rootState.TimelineSpace.account
    const client = generator(
      rootState.TimelineSpace.sns,
      account.baseURL,
      account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getFollowRequests()
    commit(MUTATION_TYPES.CHANGE_UNREAD_FOLLOW_REQUESTS, res.data.length > 0)
    return res.data
  },
  clearUnread: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_UNREAD_HOME_TIMELINE, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_NOTIFICATIONS, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_MENTIONS, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_LOCAL_TIMELINE, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_DIRECT_MESSAGES_TIMELINE, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_PUBLIC_TIMELINE, false)
  },
  changeCollapse: ({ commit }, value: boolean) => {
    win.ipcRenderer.send('change-collapse', value)
    commit(MUTATION_TYPES.CHANGE_COLLAPSE, value)
  },
  readCollapse: ({ commit }) => {
    return new Promise(resolve => {
      win.ipcRenderer.send('get-collapse')
      win.ipcRenderer.once('response-get-collapse', (_, value: boolean) => {
        commit(MUTATION_TYPES.CHANGE_COLLAPSE, value)
        resolve(value)
      })
    })
  },
  listTags: ({ commit }) => {
    return new Promise((resolve, reject) => {
      win.ipcRenderer.once('response-list-hashtags', (_, tags: Array<LocalTag>) => {
        win.ipcRenderer.removeAllListeners('error-list-hashtags')
        commit(MUTATION_TYPES.UPDATE_TAGS, tags)
        resolve(tags)
      })
      win.ipcRenderer.once('error-list-hashtags', (_, err: Error) => {
        win.ipcRenderer.removeAllListeners('response-list-hashtags')
        reject(err)
      })
      win.ipcRenderer.send('list-hashtags')
    })
  }
}

const SideMenu: Module<SideMenuState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default SideMenu
