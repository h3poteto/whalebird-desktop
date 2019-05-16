import Account, { AccountState } from './Search/Account'
import Tag, { TagState } from './Search/Tag'
import Toots, { TootsState } from './Search/Toots'
import { Module } from 'vuex'
import { RootState } from '@/store'

export interface SearchState {}

export interface SearchModuleState extends SearchState {
  Account: AccountState
  Tag: TagState
  Toots: TootsState
}

const state = (): SearchState => ({})

const Search: Module<SearchState, RootState> = {
  namespaced: true,
  modules: { Account, Tag, Toots },
  state: state
}

export default Search
