import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type EditFiltersState = {
  filter: Entity.Filter
  loading: boolean
}

const state = (): EditFiltersState => ({
  filter: {
    id: '',
    phrase: '',
    expires_at: null,
    context: [],
    irreversible: false,
    whole_word: true
  } as Entity.Filter,
  loading: false
})

export const MUTATION_TYPES = {
  UPDATE_FILTER: 'updateFilter',
  CHANGE_LOADING: 'changeLoading'
}

export const mutations: MutationTree<EditFiltersState> = {
  [MUTATION_TYPES.UPDATE_FILTER]: (state, filter: Entity.Filter) => {
    state.filter = filter
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, loading: boolean) => {
    state.loading = loading
  }
}

export const ACTION_TYPES = {
  FETCH_FILTER: 'fetchFilter',
  EDIT_FILTER: 'editFilter',
  UPDATE_FILTER: 'updateFilter'
}

export const actions: ActionTree<EditFiltersState, RootState> = {
  fetchFilter: async ({ commit, rootState }, id: string): Promise<Entity.Filter> => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    try {
      commit(MUTATION_TYPES.CHANGE_LOADING, true)
      const res = await client.getFilter(id)
      commit(MUTATION_TYPES.UPDATE_FILTER, res.data)
      return res.data
    } finally {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  },
  editFilter: ({ commit, state }, filter: any) => {
    const newFilter = Object.assign({}, state.filter, filter)
    commit(MUTATION_TYPES.UPDATE_FILTER, newFilter)
  },
  updateFilter: async ({ commit, state, rootState }): Promise<Entity.Filter> => {
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
      const res = await client.updateFilter(state.filter.id, state.filter.phrase, state.filter.context, options)
      return res.data
    } finally {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  }
}

const EditFilters: Module<EditFiltersState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default EditFilters
