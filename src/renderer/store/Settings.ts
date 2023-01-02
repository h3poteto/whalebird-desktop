import General, { GeneralState } from './Settings/General'
import Timeline, { TimelineState } from './Settings/Timeline'
import Filters, { FiltersModuleState } from './Settings/Filters'
import { Module, MutationTree } from 'vuex'
import { RootState } from '@/store'

export type SettingsState = {
  accountId: number | null
}

const state = (): SettingsState => ({
  accountId: null
})

export const MUTATION_TYPES = {
  CHANGE_ACCOUNT_ID: 'changeAccountId'
}

const mutations: MutationTree<SettingsState> = {
  [MUTATION_TYPES.CHANGE_ACCOUNT_ID]: (state, id: number) => {
    state.accountId = id
  }
}

type SettingsModule = {
  General: GeneralState
  Timeline: TimelineState
  Filters: FiltersModuleState
}

export type SettingsModuleState = SettingsModule & SettingsState

const Settings: Module<SettingsState, RootState> = {
  namespaced: true,
  modules: {
    General,
    Timeline,
    Filters
  },
  state: state,
  mutations: mutations
}

export default Settings
