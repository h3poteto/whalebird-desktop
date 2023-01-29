import Home, { HomeState } from './Contents/Home'
import Notifications, { NotificationsState } from './Contents/Notifications'
import Bookmarks, { BookmarksState } from './Contents/Bookmarks'
import Local, { LocalState } from './Contents/Local'
import Search, { SearchModuleState } from './Contents/Search'
import Lists, { ListsModuleState } from './Contents/Lists'
import Hashtag, { HashtagModuleState } from './Contents/Hashtag'
import DirectMessages, { DirectMessagesState } from './Contents/DirectMessages'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type ContentsState = {
  loading: boolean
}

type ContentsModule = {
  Home: HomeState
  Notifications: NotificationsState
  DirectMessages: DirectMessagesState
  Bookmarks: BookmarksState
  Local: LocalState
  Search: SearchModuleState
  Hashtag: HashtagModuleState
  Lists: ListsModuleState
}

export type ContentsModuleState = ContentsModule & ContentsState

const state = (): ContentsState => ({
  loading: false
})

export const MUTATION_TYPES = {
  CHANGE_LOADING: 'changeLoading'
}

const mutations: MutationTree<ContentsState> = {
  [MUTATION_TYPES.CHANGE_LOADING]: (state, loading: boolean) => {
    state.loading = loading
  }
}

export const ACTION_TYPES = {
  CHANGE_LOADING: 'changeLoading'
}

const actions: ActionTree<ContentsState, RootState> = {
  [ACTION_TYPES.CHANGE_LOADING]: ({ commit }, loading) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, loading)
  }
}

const Contents: Module<ContentsState, RootState> = {
  namespaced: true,
  state: state,
  modules: {
    Home,
    Notifications,
    Bookmarks,
    Local,
    DirectMessages,
    Search,
    Lists,
    Hashtag
  },
  mutations: mutations,
  actions: actions
}

export default Contents
