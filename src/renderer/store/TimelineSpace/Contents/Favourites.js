import Mastodon from 'megalodon'

const Favourites = {
  namespaced: true,
  state: {
    favourites: [],
    lazyLoading: false
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
    }
  },
  actions: {
    fetchFavourites ({ commit }, account) {
      const client = new Mastodon(
        account.accessToken,
        account.baseURL + '/api/v1'
      )
      return client.get('/favourites', { limit: 40 })
        .then(data => {
          commit('updateFavourites', data)
          return data
        })
    },
    lazyFetchFavourites ({ state, commit, rootState }, last) {
      if (last === undefined || last === null) {
        return Promise.resolve(null)
      }
      if (state.lazyLoading) {
        return Promise.resolve(null)
      }
      commit('changeLazyLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      // Note: Now this API's explanation and implementation are reversed.
      // So if the bug has resolved, please use max_id instead of since_id.
      // https://github.com/tootsuite/documentation/blob/master/Using-the-API/API.md#favourites
      return client.get('/favourites', { since_id: last.id, limit: 40 })
        .then(data => {
          commit('changeLazyLoading', false)
          commit('insertFavourites', data)
          return data
        })
        .catch(err => {
          commit('changeLazyLoading', false)
          throw err
        })
    }
  }
}

export default Favourites
