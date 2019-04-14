import Account, { AccountState } from './Search/Account'
import Tag from './Search/Tag'
import Toots from './Search/Toots'
import { Module, MutationTree } from 'vuex'
import { RootState } from '@/store'

export interface SearchState {
  loading: boolean
}

export interface SearchModuleState extends SearchState {
  Account: AccountState
}

const state = (): SearchState => ({
  loading: false
})

export const MUTATION_TYPES = {
  CHANGE_LOADING: 'changeLoading'
}

const mutations: MutationTree<SearchState> = {
  [MUTATION_TYPES.CHANGE_LOADING]: (state, loading: boolean) => {
    state.loading = loading
  }
}

const Search: Module<SearchState, RootState> = {
  namespaced: true,
  modules: { Account, Tag, Toots },
  state: state,
  mutations: mutations
}

export default Search
