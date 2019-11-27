import Mastodon, { Status, Context, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type TootDetailState = {
  message: Status | null
  ancestors: Array<Status>
  descendants: Array<Status>
}

const state = (): TootDetailState => ({
  message: null,
  ancestors: [],
  descendants: []
})

export const MUTATION_TYPES = {
  CHANGE_TOOT: 'changeToot',
  UPDATE_ANCESTORS: 'updateAncestors',
  UPDATE_DESCENDANTS: 'updateDescendants',
  UPDATE_ANCESTORS_TOOT: 'updateAncestorsToot',
  DELETE_ANCESTORS_TOOT: 'deleteAncestorsToot',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  UPDATE_DESCENDANTS_TOOT: 'updateDescendantsToot',
  DELETE_DESCENDANTS_TOOT: 'deleteDescendantsToot'
}

const mutations: MutationTree<TootDetailState> = {
  [MUTATION_TYPES.CHANGE_TOOT]: (state, message: Status) => {
    state.message = message
  },
  [MUTATION_TYPES.UPDATE_ANCESTORS]: (state, ancestors: Array<Status>) => {
    state.ancestors = ancestors
  },
  [MUTATION_TYPES.UPDATE_DESCENDANTS]: (state, descendants: Array<Status>) => {
    state.descendants = descendants
  },
  [MUTATION_TYPES.UPDATE_ANCESTORS_TOOT]: (state, message: Status) => {
    // Replace target message in ancestors
    state.ancestors = state.ancestors.map(toot => {
      if (toot.id === message.id) {
        return message
      } else if (toot.reblog !== null && toot.reblog.id === message.id) {
        // When user reblog/favourite a reblogged toot, target message is a original toot.
        // So, a message which is received now is original toot.
        const reblog = {
          reblog: message
        }
        return Object.assign(toot, reblog)
      } else {
        return toot
      }
    })
  },
  [MUTATION_TYPES.DELETE_ANCESTORS_TOOT]: (state, message: Status) => {
    state.ancestors = state.ancestors.filter(toot => {
      if (toot.reblog !== null && toot.reblog.id === message.id) {
        return false
      } else {
        return toot.id !== message.id
      }
    })
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Status) => {
    if (state.message === null) {
      return
    }
    if (state.message.id === message.id) {
      state.message = message
    } else if (state.message.reblog !== null && state.message.reblog.id === message.id) {
      // When user reblog/favourite a reblogged toot, target message is a original toot.
      // So, a message which is received now is original toot.
      const reblog = {
        reblog: message
      }
      state.message = Object.assign({}, state.message, reblog)
    }
  },
  [MUTATION_TYPES.DELETE_TOOT]: (state, message: Status) => {
    if (state.message === null) {
      return
    }
    if (state.message.id === message.id) {
      state.message = null
    }
  },
  [MUTATION_TYPES.UPDATE_DESCENDANTS_TOOT]: (state, message: Status) => {
    // Replace target message in descendants
    state.descendants = state.descendants.map(toot => {
      if (toot.id === message.id) {
        return message
      } else if (toot.reblog !== null && toot.reblog.id === message.id) {
        // When user reblog/favourite a reblogged toot, target message is a original toot.
        // So, a message which is received now is original toot.
        const reblog = {
          reblog: message
        }
        return Object.assign(toot, reblog)
      } else {
        return toot
      }
    })
  },
  [MUTATION_TYPES.DELETE_DESCENDANTS_TOOT]: (state, message: Status) => {
    state.descendants = state.descendants.filter(toot => {
      if (toot.reblog !== null && toot.reblog.id === message.id) {
        return false
      } else {
        return toot.id !== message.id
      }
    })
  }
}

const actions: ActionTree<TootDetailState, RootState> = {
  changeToot: ({ commit }, message: Status) => {
    commit(MUTATION_TYPES.UPDATE_ANCESTORS, [])
    commit(MUTATION_TYPES.UPDATE_DESCENDANTS, [])
    commit(MUTATION_TYPES.CHANGE_TOOT, message)
  },
  fetchToot: async ({ commit, rootState }, message: Status) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Context> = await client.get<Context>(`/statuses/${message.id}/context`, { limit: 40 })

    commit(MUTATION_TYPES.UPDATE_ANCESTORS, res.data.ancestors)
    commit(MUTATION_TYPES.UPDATE_DESCENDANTS, res.data.descendants)
    return res.data
  },
  reload: async ({ state, dispatch }) => {
    await dispatch('fetchToot', state.message)
  }
}

const TootDetail: Module<TootDetailState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default TootDetail
