import Mastodon from 'megalodon'
import parse from 'parse-link-header'

const Favourites = {
  namespaced: true,
  state: {
    favourites: [],
    lazyLoading: false,
    filter: '',
    maxId: null
  },
  mutations: {
    updateFavourites (state, favourites) {
      state.favourites = favourites
    },
    insertFavourites (state, favourites) {
      state.favourites = state.favourites.concat(favourites)
    },
    updateToot (state, message) {
      state.favourites = state.favourites.map((toot) => {
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
    deleteToot (state, message) {
      state.timeline = state.timeline.filter((toot) => {
        if (toot.reblog !== null && toot.reblog.id === message.id) {
          return false
        } else {
          return toot.id !== message.id
        }
      })
    },
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    },
    changeFilter (state, filter) {
      state.filter = filter
    },
    changeMaxId (state, id) {
      state.maxId = id
    }
  },
  actions: {
    async fetchFavourites ({ commit }, account) {
      const client = new Mastodon(
        account.accessToken,
        account.baseURL + '/api/v1'
      )
      const res = await client.get('/favourites', { limit: 40 })
      commit('updateFavourites', res.data)
      // Parse link header
      try {
        const link = parse(res.headers.link)
        commit('changeMaxId', link.next.max_id)
      } catch (err) {
        console.error(err)
      }
      return res.data
    },
    lazyFetchFavourites ({ state, commit, rootState }) {
      if (state.lazyLoading) {
        return Promise.resolve(null)
      }
      if (!state.maxId) {
        return null
      }
      commit('changeLazyLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/favourites', { max_id: state.maxId, limit: 40 })
        .then(res => {
          commit('changeLazyLoading', false)
          commit('insertFavourites', res.data)
          // Parse link header
          const link = parse(res.headers.link)
          commit('changeMaxId', link.next.max_id)
          return res.data
        })
        .catch(err => {
          commit('changeLazyLoading', false)
          throw err
        })
    }
  }
}

export default Favourites
