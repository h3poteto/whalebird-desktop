import { Module, MutationTree, ActionTree } from 'vuex'
import generator, { Entity } from 'megalodon'
import { RootState } from '@/store'
import EditFilters, { EditFiltersState } from './Filters/Edit'
import NewFilters, { NewFiltersState } from './Filters/New'

export type FiltersState = {
  filters: Array<Entity.Filter>
  filtersLoading: boolean
}

const state = (): FiltersState => ({
  filters: [],
  filtersLoading: false
})

export const MUTATION_TYPES = {
  UPDATE_FILTERS: 'updateFilters',
  CHANGE_LOADING: 'changeLoading'
}

export const mutations: MutationTree<FiltersState> = {
  [MUTATION_TYPES.UPDATE_FILTERS]: (state, filters: Array<Entity.Filter>) => {
    state.filters = filters
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, loading: boolean) => {
    state.filtersLoading = loading
  }
}
export const actions: ActionTree<FiltersState, RootState> = {
  fetchFilters: async ({ commit, rootState }): Promise<Array<Entity.Filter>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    try {
      commit(MUTATION_TYPES.CHANGE_LOADING, true)
      const res = await client.getFilters()
      commit(MUTATION_TYPES.UPDATE_FILTERS, res.data)
      return res.data
    } finally {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  },
  deleteFilter: async ({ commit, dispatch, rootState }, id: string) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    try {
      commit(MUTATION_TYPES.CHANGE_LOADING, true)
      await client.deleteFilter(id)
      await dispatch('fetchFilters')
    } finally {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  }
}

type FiltersModule = {
  Edit: EditFiltersState
  New: NewFiltersState
}

export type FiltersModuleState = FiltersModule & FiltersState

const Filters: Module<FiltersState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  modules: {
    Edit: EditFilters,
    New: NewFilters
  }
}

export default Filters
