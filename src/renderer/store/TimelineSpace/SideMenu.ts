import Mastodon, { List, Response } from 'megalodon'
import { ipcRenderer } from 'electron'
import { Module, MutationTree, ActionTree } from 'vuex'
import LocalTag from '~/src/types/localTag'
import LocalAccount from '~/src/types/localAccount'
import { RootState } from '@/store'

export interface SideMenuState {
  unreadHomeTimeline: boolean,
  unreadNotifications: boolean,
  unreadMentions: boolean,
  unreadLocalTimeline: boolean,
  unreadDirectMessagesTimeline: boolean,
  unreadPublicTimeline: boolean,
  lists: Array<List>,
  tags: Array<LocalTag>,
  collapse: boolean
}

const state = (): SideMenuState => ({
  unreadHomeTimeline: false,
  unreadNotifications: false,
  unreadMentions: false,
  unreadLocalTimeline: false,
  unreadDirectMessagesTimeline: false,
  unreadPublicTimeline: false,
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
  [MUTATION_TYPES.UPDATE_LISTS]: (state, lists: Array<List>) => {
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
  fetchLists: async ({ commit, rootState }, account: LocalAccount | null = null): Promise<Array<List>> => {
    if (account === null) account = rootState.TimelineSpace.account
    const client = new Mastodon(
      account!.accessToken!,
      account!.baseURL + '/api/v1'
    )
    const res: Response<Array<List>> = await client.get<Array<List>>('/lists')
    commit(MUTATION_TYPES.UPDATE_LISTS, res.data)
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
    ipcRenderer.send('change-collapse', value)
    commit(MUTATION_TYPES.CHANGE_COLLAPSE, value)
  },
  readCollapse: ({ commit }) => {
    return new Promise(resolve => {
      ipcRenderer.send('get-collapse')
      ipcRenderer.once('response-get-collapse', (_, value: boolean) => {
        commit(MUTATION_TYPES.CHANGE_COLLAPSE, value)
        resolve(value)
      })
    })
  },
  listTags: ({ commit }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('response-list-hashtags', (_, tags: Array<LocalTag>) => {
        ipcRenderer.removeAllListeners('error-list-hashtags')
        commit(MUTATION_TYPES.UPDATE_TAGS, tags)
        resolve(tags)
      })
      ipcRenderer.once('error-list-hashtags', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-list-hashtags')
        reject(err)
      })
      ipcRenderer.send('list-hashtags')
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
