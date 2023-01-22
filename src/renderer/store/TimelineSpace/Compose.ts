import { Module, MutationTree } from 'vuex'
import { RootState } from '@/store'

export type ReplyTo = {
  acct: string
  id: string
}

export type ComposeState = {
  inReplyTo: ReplyTo | null
}

const state = (): ComposeState => ({
  inReplyTo: null
})

export const MUTATION_TYPES = {
  SET_REPLY_TO_ID: 'setReplyToId',
  CLEAR_REPLY_TO_ID: 'clearReplyToId'
}

const mutations: MutationTree<ComposeState> = {
  [MUTATION_TYPES.SET_REPLY_TO_ID]: (state, inReplyTo: ReplyTo) => {
    state.inReplyTo = inReplyTo
  },
  [MUTATION_TYPES.CLEAR_REPLY_TO_ID]: state => {
    state.inReplyTo = null
  }
}

const Compose: Module<ComposeState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations
}

export default Compose
