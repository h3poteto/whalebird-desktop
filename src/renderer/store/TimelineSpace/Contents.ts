import SideBar, { SideBarModuleState } from './Contents/SideBar'
import Home, { HomeState } from './Contents/Home'
import Notifications, { NotificationsState } from './Contents/Notifications'
import Favourites, { FavouritesState } from './Contents/Favourites'
import Local, { LocalState } from './Contents/Local'
import Public, { PublicState } from './Contents/Public'
import Search, { SearchModuleState } from './Contents/Search'
import Lists from './Contents/Lists'
import Hashtag, { HashtagModuleState } from './Contents/Hashtag'
import DirectMessages, { DirectMessagesState } from './Contents/DirectMessages'
import FollowRequests, { FollowRequestsState } from './Contents/FollowRequests'
import Mentions, { MentionsState } from './Contents/Mentions'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface ContentsState {
  loading: boolean
}

export interface ContentsModuleState extends ContentsState {
  SideBar: SideBarModuleState
  Home: HomeState
  Notifications: NotificationsState
  Mentions: MentionsState
  DirectMessages: DirectMessagesState
  Favourites: FavouritesState
  Local: LocalState
  Public: PublicState
  Search: SearchModuleState
  Hashtag: HashtagModuleState
  FollowRequests: FollowRequestsState
}

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

const actions: ActionTree<ContentsState, RootState> = {
  changeLoading: ({ commit }, loading) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, loading)
  }
}

const Contents: Module<ContentsState, RootState> = {
  namespaced: true,
  state: state,
  modules: {
    SideBar,
    Home,
    Notifications,
    Favourites,
    Local,
    DirectMessages,
    Mentions,
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
