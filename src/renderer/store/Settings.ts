import General, { GeneralState } from './Settings/General'
import Timeline, { TimelineState } from './Settings/Timeline'
import { Module, MutationTree } from 'vuex'
import { RootState } from '@/store'

export type SettingsState = {
  accountID: string | null
}

const state = (): SettingsState => ({
  accountID: null
})

export const MUTATION_TYPES = {
  CHANGE_ACCOUNT_ID: 'changeAccountID'
}

const mutations: MutationTree<SettingsState> = {
  [MUTATION_TYPES.CHANGE_ACCOUNT_ID]: (state, id: string) => {
    state.accountID = id
  }
}

type SettingsModule = {
  General: GeneralState
  Timeline: TimelineState
}

export type SettingsModuleState = SettingsModule & SettingsState

const Settings: Module<SettingsState, RootState> = {
  namespaced: true,
  modules: {
    General,
    Timeline
  },
  state: state,
  mutations: mutations
}

export default Settings
