import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type NewFiltersState = {
  filter: Entity.Filter
  loading: boolean
}

const defaultFilter: Entity.Filter = {
  id: '',
  phrase: '',
  expires_at: null,
  context: [],
  irreversible: false,
  whole_word: true
}

const state = (): NewFiltersState => ({
  filter: defaultFilter,
  loading: false
})

export const MUTATION_TYPES = {
  UPDATE_FILTER: 'updateFilter',
  CHANGE_LOADING: 'changeLoading'
}

export const mutations: MutationTree<NewFiltersState> = {
  [MUTATION_TYPES.UPDATE_FILTER]: (state, filter: Entity.Filter) => {
    state.filter = filter
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, loading: boolean) => {
    state.loading = loading
  }
}

export const actions: ActionTree<NewFiltersState, RootState> = {
  editFilter: ({ commit, state }, filter: any) => {
    const newFilter = Object.assign({}, state.filter, filter)
    commit(MUTATION_TYPES.UPDATE_FILTER, newFilter)
  },
  resetFilter: ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_FILTER, defaultFilter)
  },
  createFilter: async ({ commit, state, dispatch, rootState }): Promise<Entity.Filter> => {
    if (state.filter === null) {
      throw new Error('filter is not set')
    }
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    try {
      commit(MUTATION_TYPES.CHANGE_LOADING, true)
      let options = {
        irreversible: state.filter.irreversible,
        whole_word: state.filter.whole_word
      }
      if (state.filter.expires_at !== null) {
        options = Object.assign({}, options, {
          expires_in: state.filter.expires_at
        })
      }
      const res = await client.createFilter(state.filter.phrase, state.filter.context, options)
      dispatch('resetFilter')
      return res.data
    } finally {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  }
}

const NewFilters: Module<NewFiltersState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default NewFilters
