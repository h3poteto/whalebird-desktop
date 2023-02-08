import { Module, MutationTree } from 'vuex'
import { RootState } from '@/store'
import { Entity } from 'megalodon'

export type ComposeState = {
  inReplyTo: Entity.Status | null
  quoteTo: Entity.Status | null
}

const state = (): ComposeState => ({
  inReplyTo: null,
  quoteTo: null
})

export const MUTATION_TYPES = {
  SET_REPLY_TO_ID: 'setReplyToId',
  CLEAR_REPLY_TO_ID: 'clearReplyToId',
  SET_QUOTE_TO: 'setQuoteTo',
  CLEAR_QUOTE_TO: 'clearQuoteTo'
}

const mutations: MutationTree<ComposeState> = {
  [MUTATION_TYPES.SET_REPLY_TO_ID]: (state, inReplyTo: Entity.Status) => {
    state.inReplyTo = inReplyTo
  },
  [MUTATION_TYPES.CLEAR_REPLY_TO_ID]: state => {
    state.inReplyTo = null
  },
  [MUTATION_TYPES.SET_QUOTE_TO]: (state, quoteTo: Entity.Status) => {
    state.quoteTo = quoteTo
  },
  [MUTATION_TYPES.CLEAR_QUOTE_TO]: state => {
    state.quoteTo = null
  }
}

const Compose: Module<ComposeState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations
}

export default Compose
