import AccountProfile, { AccountProfileModuleState } from './SideBar/AccountProfile'
import TootDetail, { TootDetailState } from './SideBar/TootDetail'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

enum Component {
  Blank,
  AccountProfile,
  TootDetail
}

export type SideBarState = {
  openSideBar: boolean
  component: Component
}

type SideBarModule = {
  TootDetail: TootDetailState
  AccountProfile: AccountProfileModuleState
}

export type SideBarModuleState = SideBarModule & SideBarState

const state = (): SideBarState => ({
  openSideBar: false,
  component: Component.Blank
})

export const MUTATION_TYPES = {
  CHANGE_OPEN_SIDEBAR: 'changeOpenSideBar',
  CHANGE_COMPONENT: 'changeComponent'
}

const mutations: MutationTree<SideBarState> = {
  [MUTATION_TYPES.CHANGE_OPEN_SIDEBAR]: (state, value: boolean) => {
    state.openSideBar = value
  },
  [MUTATION_TYPES.CHANGE_COMPONENT]: (state, value: Component) => {
    state.component = value
  }
}

const actions: ActionTree<SideBarState, RootState> = {
  close: ({ dispatch, commit }) => {
    dispatch('TimelineSpace/Contents/SideBar/AccountProfile/close', {}, { root: true })
    commit(MUTATION_TYPES.CHANGE_OPEN_SIDEBAR, false)
    commit(MUTATION_TYPES.CHANGE_COMPONENT, Component.Blank)
  },
  reload: ({ state, dispatch }) => {
    if (state.component === Component.AccountProfile) {
      dispatch('TimelineSpace/Contents/SideBar/AccountProfile/reload', {}, { root: true })
    } else if (state.component === Component.TootDetail) {
      dispatch('TimelineSpace/Contents/SideBar/TootDetail/reload', {}, { root: true })
    }
  },
  openAccountComponent: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_COMPONENT, Component.AccountProfile)
  },
  openTootComponent: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_COMPONENT, Component.TootDetail)
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
