import General from './Settings/General'
import Timeline from './Settings/Timeline'
import { Module, MutationTree } from 'vuex'

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

// TODO: use type of rootState
const Settings: Module<SettingsState, any> = {
  namespaced: true,
  modules: {
    General,
    Timeline
  },
  state: state,
  mutations: mutations
}

export default Settings
