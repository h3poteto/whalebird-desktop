import generator, { Entity } from 'megalodon'
import parse from 'parse-link-header'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { LocalAccount } from '~src/types/localAccount'
import { LocalServer } from '~src/types/localServer'

export type BookmarksState = {
  bookmarks: Array<Entity.Status>
  maxId: string | null
}

const state = (): BookmarksState => ({
  bookmarks: [],
  maxId: null
})

export const MUTATION_TYPES = {
  UPDATE_BOOKMARKS: 'updateBookmarks',
  INSERT_BOOKMARKS: 'insertBookmarks',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  CHANGE_MAX_ID: 'changeMaxId'
}

const mutations: MutationTree<BookmarksState> = {
  [MUTATION_TYPES.UPDATE_BOOKMARKS]: (state, bookmarks: Array<Entity.Status>) => {
    state.bookmarks = bookmarks
  },
  [MUTATION_TYPES.INSERT_BOOKMARKS]: (state, bookmarks: Array<Entity.Status>) => {
    state.bookmarks = state.bookmarks.concat(bookmarks)
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    state.bookmarks = state.bookmarks.map(toot => {
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
  [MUTATION_TYPES.DELETE_TOOT]: (state, message: Entity.Status) => {
    state.bookmarks = state.bookmarks.filter(toot => {
      if (toot.reblog !== null && toot.reblog.id === message.id) {
        return false
      } else {
        return toot.id !== message.id
      }
    })
  },
  [MUTATION_TYPES.CHANGE_MAX_ID]: (state, id: string | null) => {
    state.maxId = id
  }
}

export const ACTION_TYPES = {
  FETCH_BOOKMARKS: 'fetchBookmarks',
  LAZY_FETCH_BOOKMARKS: 'lazyFetchBookmarks'
}

const actions: ActionTree<BookmarksState, RootState> = {
  [ACTION_TYPES.FETCH_BOOKMARKS]: async (
    { commit, rootState },
    req: { account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status>> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.getBookmarks({ limit: 20 })
    commit(MUTATION_TYPES.UPDATE_BOOKMARKS, res.data)
    // Parse link header
    try {
      const link = parse(res.headers.link)
      if (link !== null && link.next) {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, link.next.max_id)
      } else {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      }
    } catch (err) {
      commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      console.error(err)
    }
    return res.data
  },
  [ACTION_TYPES.LAZY_FETCH_BOOKMARKS]: async (
    { state, commit, rootState },
    req: { account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status> | null> => {
    if (!state.maxId) {
      return Promise.resolve(null)
    }
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.getFavourites({ max_id: state.maxId, limit: 20 })
    commit(MUTATION_TYPES.INSERT_BOOKMARKS, res.data)
    // Parse link header
    try {
      const link = parse(res.headers.link)
      if (link !== null && link.next) {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, link.next.max_id)
      } else {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      }
    } catch (err) {
      commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      console.error(err)
    }
    return res.data
  }
}

const Bookmark: Module<BookmarksState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Bookmark
