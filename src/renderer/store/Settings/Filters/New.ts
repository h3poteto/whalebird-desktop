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

export const ACTION_TYPES = {
  EDIT_FILTER: 'editFilter',
  RESET_FILTER: 'resetFilter',
  CREATE_FILTER: 'createFilter'
}

export const actions: ActionTree<NewFiltersState, RootState> = {
  [ACTION_TYPES.EDIT_FILTER]: ({ commit, state }, filter: any) => {
    const newFilter = Object.assign({}, state.filter, filter)
    commit(MUTATION_TYPES.UPDATE_FILTER, newFilter)
  },
  [ACTION_TYPES.RESET_FILTER]: ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_FILTER, defaultFilter)
  },
  [ACTION_TYPES.CREATE_FILTER]: async ({ commit, state, dispatch, rootState }): Promise<Entity.Filter> => {
    if (state.filter === null) {
      throw new Error('filter is not set')
    }
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
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
