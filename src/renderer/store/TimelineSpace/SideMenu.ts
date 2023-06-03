import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

export type SideMenuState = {
  unreadHomeTimeline: boolean
  unreadNotifications: boolean
  unreadLocalTimeline: boolean
  unreadDirectMessagesTimeline: boolean
  unreadPublicTimeline: boolean
  collapse: boolean
}

const state = (): SideMenuState => ({
  unreadHomeTimeline: false,
  unreadNotifications: false,
  unreadLocalTimeline: false,
  unreadDirectMessagesTimeline: false,
  unreadPublicTimeline: false,
  collapse: false
})

export const MUTATION_TYPES = {
  CHANGE_UNREAD_HOME_TIMELINE: 'changeUnreadHomeTimeline',
  CHANGE_UNREAD_NOTIFICATIONS: 'changeUnreadNotifications',
  CHANGE_UNREAD_LOCAL_TIMELINE: 'changeUnreadLocalTimeline',
  CHANGE_UNREAD_DIRECT_MESSAGES_TIMELINE: 'changeUnreadDirectMessagesTimeline',
  CHANGE_UNREAD_PUBLIC_TIMELINE: 'changeUnreadPublicTimeline',
  CHANGE_COLLAPSE: 'changeCollapse'
}

const mutations: MutationTree<SideMenuState> = {
  [MUTATION_TYPES.CHANGE_UNREAD_HOME_TIMELINE]: (state, value: boolean) => {
    state.unreadHomeTimeline = value
  },
  [MUTATION_TYPES.CHANGE_UNREAD_NOTIFICATIONS]: (state, value: boolean) => {
    state.unreadNotifications = value
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
  [MUTATION_TYPES.CHANGE_COLLAPSE]: (state, collapse: boolean) => {
    state.collapse = collapse
  }
}

export const ACTION_TYPES = {
  CLEAR_UNREAD: 'clearUnread',
  CHANGE_COLLAPSE: 'changeCollapse',
  READ_COLLAPSE: 'readCollapse'
}

const actions: ActionTree<SideMenuState, RootState> = {
  [ACTION_TYPES.CLEAR_UNREAD]: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_UNREAD_HOME_TIMELINE, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_NOTIFICATIONS, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_LOCAL_TIMELINE, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_DIRECT_MESSAGES_TIMELINE, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_PUBLIC_TIMELINE, false)
  },
  [ACTION_TYPES.CHANGE_COLLAPSE]: ({ commit }, value: boolean) => {
    win.ipcRenderer.send('change-collapse', value)
    commit(MUTATION_TYPES.CHANGE_COLLAPSE, value)
  },
  [ACTION_TYPES.READ_COLLAPSE]: async ({ commit }) => {
    const value: boolean = await win.ipcRenderer.invoke('get-collapse')
    commit(MUTATION_TYPES.CHANGE_COLLAPSE, value)
    return value
  }
}

const SideMenu: Module<SideMenuState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default SideMenu
