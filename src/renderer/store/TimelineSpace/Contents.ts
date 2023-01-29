import Home, { HomeState } from './Contents/Home'
import Notifications, { NotificationsState } from './Contents/Notifications'
import Favourites, { FavouritesState } from './Contents/Favourites'
import Bookmarks, { BookmarksState } from './Contents/Bookmarks'
import Local, { LocalState } from './Contents/Local'
import Public, { PublicState } from './Contents/Public'
import Search, { SearchModuleState } from './Contents/Search'
import Lists, { ListsModuleState } from './Contents/Lists'
import Hashtag, { HashtagModuleState } from './Contents/Hashtag'
import DirectMessages, { DirectMessagesState } from './Contents/DirectMessages'
import FollowRequests, { FollowRequestsState } from './Contents/FollowRequests'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type ContentsState = {
  loading: boolean
}

type ContentsModule = {
  Home: HomeState
  Notifications: NotificationsState
  DirectMessages: DirectMessagesState
  Favourites: FavouritesState
  Bookmarks: BookmarksState
  Local: LocalState
  Public: PublicState
  Search: SearchModuleState
  Hashtag: HashtagModuleState
  FollowRequests: FollowRequestsState
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
    Favourites,
    Bookmarks,
    Local,
    DirectMessages,
    Public,
    Search,
    Lists,
    Hashtag,
    FollowRequests
  },
  mutations: mutations,
  actions: actions
}

export default Contents
