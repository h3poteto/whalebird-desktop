import Account, { AccountState } from './Search/Account'
import Tag, { TagState } from './Search/Tag'
import Toots, { TootsState } from './Search/Toots'
import { Module } from 'vuex'
import { RootState } from '@/store'

export type SearchState = {}

type SearchModule = {
  Account: AccountState
  Tag: TagState
  Toots: TootsState
}

export type SearchModuleState = SearchModule & SearchState

const state = (): SearchState => ({})

const Search: Module<SearchState, RootState> = {
  namespaced: true,
  modules: { Account, Tag, Toots },
  state: state
}

export default Search
