import Index, { IndexState } from './Lists/Index'
import Show, { ShowState } from './Lists/Show'
import Edit, { EditState } from './Lists/Edit'
import { Module } from 'vuex'
import { RootState } from '@/store'

export interface ListsState {}

export interface ListsModuleState extends ListsState {
  Index: IndexState,
  Show: ShowState,
  Edit: EditState
}

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
