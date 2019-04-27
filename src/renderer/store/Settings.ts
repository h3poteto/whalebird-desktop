import General, { GeneralState } from './Settings/General'
import Timeline, { TimelineState } from './Settings/Timeline'
import { Module, MutationTree } from 'vuex'
import { RootState } from '@/store'

export interface SettingsState {
  accountID: number | null
}

const state = (): SettingsState => ({
  accountID: null
})

export const MUTATION_TYPES = {
  CHANGE_ACCOUNT_ID: 'changeAccountID'
}

const mutations: MutationTree<SettingsState> = {
  [MUTATION_TYPES.CHANGE_ACCOUNT_ID]: (state, id: number) => {
    state.accountID = id
  }
}

export interface SettingsModuleState extends SettingsState {
  General: GeneralState,
  Timeline: TimelineState,
}

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
