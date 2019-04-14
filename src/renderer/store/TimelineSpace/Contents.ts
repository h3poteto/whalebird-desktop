import SideBar, { SideBarModuleState } from './Contents/SideBar'
import Home, { HomeState } from './Contents/Home'
import Notifications, { NotificationsState } from './Contents/Notifications'
import Favourites from './Contents/Favourites'
import Local, { LocalState } from './Contents/Local'
import Public, { PublicState } from './Contents/Public'
import Search, { SearchModuleState } from './Contents/Search'
import Lists from './Contents/Lists'
import Hashtag, { HashtagModuleState } from './Contents/Hashtag'
import DirectMessages, { DirectMessagesState } from './Contents/DirectMessages'
import Mentions, { MentionsState } from './Contents/Mentions'
import { Module } from 'vuex'
import { RootState } from '@/store'

export interface ContentsState {}

export interface ContentsModuleState extends ContentsState {
  SideBar: SideBarModuleState,
  Home: HomeState,
  Notifications: NotificationsState,
  Mentions: MentionsState,
  DirectMessages: DirectMessagesState,
  Local: LocalState,
  Public: PublicState,
  Search: SearchModuleState,
  Hashtag: HashtagModuleState
}

const state = (): ContentsState => ({})

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
    Hashtag
  }
}

export default Contents
