import AccountProfile, { AccountProfileModuleState } from './SideBar/AccountProfile'
import TootDetail, { TootDetailState } from './SideBar/TootDetail'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface SideBarState {
  openSideBar: boolean,
  // 0: blank
  // 1: account-profile
  // 2: toot-detail
  component: number
}

export interface SideBarModuleState extends SideBarState {
  TootDetail: TootDetailState,
  AccountProfile: AccountProfileModuleState
}

const state = (): SideBarState => ({
  openSideBar: false,
  component: 0
})

export const MUTATION_TYPES = {
  CHANGE_OPEN_SIDEBAR: 'changeOpenSideBar',
  CHANGE_COMPONENT: 'changeComponent'
}

const mutations: MutationTree<SideBarState> = {
  [MUTATION_TYPES.CHANGE_OPEN_SIDEBAR]: (state, value: boolean) => {
    state.openSideBar = value
  },
  [MUTATION_TYPES.CHANGE_COMPONENT]: (state, value: number) => {
    state.component = value
  }
}

const actions: ActionTree<SideBarState, RootState> = {
  close: ({ dispatch, commit }) => {
    dispatch('TimelineSpace/Contents/SideBar/AccountProfile/close', {}, { root: true })
    commit(MUTATION_TYPES.CHANGE_OPEN_SIDEBAR, false)
    commit(MUTATION_TYPES.CHANGE_COMPONENT, 0)
  },
  openAccountComponent: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_COMPONENT, 1)
  },
  openTootComponent: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_COMPONENT, 2)
  }
}

const SideBar: Module<SideBarState, RootState> = {
  namespaced: true,
  modules: {
    AccountProfile,
    TootDetail
  },
  state: state,
  mutations: mutations,
  actions: actions
}

export default SideBar
