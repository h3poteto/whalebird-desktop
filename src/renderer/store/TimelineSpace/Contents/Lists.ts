import Index from './Lists/Index'
import Show from './Lists/Show'
import Edit from './Lists/Edit'
import { Module } from 'vuex'
import { RootState } from '@/store'

export interface ListsState {}

export interface ListsModuleState extends ListsState {}

const state = (): ListsState => ({})

export default {
  namespaced: true,
  state: state,
  modules: {
    Index,
    Show,
    Edit
  }
} as Module<ListsState, RootState>
