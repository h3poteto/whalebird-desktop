import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { LocalTag } from '~/src/types/localTag'
import { LocalAccount } from '~/src/types/localAccount'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { EnabledTimelines } from '~/src/types/enabledTimelines'

const win = window as any as MyWindow

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
  enabledTimelines: EnabledTimelines
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
  collapse: false,
  enabledTimelines: {
    home: true,
    notification: true,
    mention: true,
    direct: true,
    favourite: true,
    bookmark: true,
    local: true,
    public: true,
    tag: true,
    list: true
  }
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
  UPDATE_TAGS: 'updateTags',
  UPDATE_ENABLED_TIMELINES: 'updateEnabledTimelines'
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
  },
  [MUTATION_TYPES.UPDATE_ENABLED_TIMELINES]: (state, timelines: EnabledTimelines) => {
    state.enabledTimelines = timelines
  }
}

export const ACTION_TYPES = {
  FETCH_LISTS: 'fetchLists',
  FETCH_FOLLOW_REQUESTS: 'fetchFollowRequests',
  CONFIRM_TIMELINES: 'confirmTimelines',
  DISABLE_LOCAL: 'disableLocal',
  DISABLE_PUBLIC: 'disablePublic',
  DISABLE_DIRECT: 'disableDirect',
  CLEAR_UNREAD: 'clearUnread',
  CHANGE_COLLAPSE: 'changeCollapse',
  READ_COLLAPSE: 'readCollapse',
  LIST_TAGS: 'listTags'
}

const actions: ActionTree<SideMenuState, RootState> = {
  [ACTION_TYPES.FETCH_LISTS]: async ({ commit, rootState }, account: LocalAccount | null = null): Promise<Array<Entity.List>> => {
    if (account === null) account = rootState.TimelineSpace.account
    const client = generator(rootState.TimelineSpace.sns, account.baseURL, account.accessToken, rootState.App.userAgent)
    const res = await client.getLists()
    commit(MUTATION_TYPES.UPDATE_LISTS, res.data)
    return res.data
  },
  [ACTION_TYPES.FETCH_FOLLOW_REQUESTS]: async (
    { commit, rootState },
    account: LocalAccount | null = null
  ): Promise<Array<Entity.Account>> => {
    if (account === null) account = rootState.TimelineSpace.account
    const client = generator(rootState.TimelineSpace.sns, account.baseURL, account.accessToken, rootState.App.userAgent)
    const res = await client.getFollowRequests()
    commit(MUTATION_TYPES.CHANGE_UNREAD_FOLLOW_REQUESTS, res.data.length > 0)
    return res.data
  },
  [ACTION_TYPES.CONFIRM_TIMELINES]: async ({ commit, rootState }, account: LocalAccount | null = null) => {
    if (account === null) account = rootState.TimelineSpace.account
    const timelines: EnabledTimelines = await win.ipcRenderer.invoke('confirm-timelines', account)
    commit(MUTATION_TYPES.UPDATE_ENABLED_TIMELINES, timelines)
  },
  [ACTION_TYPES.DISABLE_LOCAL]: ({ commit, state }) => {
    let timelines = state.enabledTimelines
    timelines = { ...timelines, local: false }
    commit(MUTATION_TYPES.UPDATE_ENABLED_TIMELINES, timelines)
  },
  [ACTION_TYPES.DISABLE_PUBLIC]: ({ commit, state }) => {
    let timelines = state.enabledTimelines
    timelines = { ...timelines, public: false }
    commit(MUTATION_TYPES.UPDATE_ENABLED_TIMELINES, timelines)
  },
  [ACTION_TYPES.DISABLE_DIRECT]: ({ commit, state }) => {
    let timelines = state.enabledTimelines
    timelines = { ...timelines, direct: false }
    commit(MUTATION_TYPES.UPDATE_ENABLED_TIMELINES, timelines)
  },
  [ACTION_TYPES.CLEAR_UNREAD]: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_UNREAD_HOME_TIMELINE, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_NOTIFICATIONS, false)
    commit(MUTATION_TYPES.CHANGE_UNREAD_MENTIONS, false)
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
  },
  [ACTION_TYPES.LIST_TAGS]: async ({ commit }) => {
    const tags: Array<LocalTag> = await win.ipcRenderer.invoke('list-hashtags')
    commit(MUTATION_TYPES.UPDATE_TAGS, tags)
    return tags
  }
}

const SideMenu: Module<SideMenuState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default SideMenu
