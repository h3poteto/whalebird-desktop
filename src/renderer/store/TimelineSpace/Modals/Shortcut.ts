import { Module, MutationTree } from 'vuex'
import { RootState } from '@/store'

export type ShortcutState = {
  modalOpen: boolean
}

const state = (): ShortcutState => ({
  modalOpen: false
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal'
}

const mutations: MutationTree<ShortcutState> = {
  [MUTATION_TYPES.CHANGE_MODAL]: (state, value: boolean) => {
    state.modalOpen = value
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations
} as Module<ShortcutState, RootState>
