import Mastodon from 'mastodon-api'

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
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    }
  },
  actions: {
    fetchFavourites ({ commit }, account) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: account.accessToken,
            api_url: account.baseURL + '/api/v1'
          }
        )
        client.get('/favourites', { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateFavourites', data)
          resolve(res)
        })
      })
    },
    lazyFetchFavourites ({ state, commit, rootState }, last) {
      return new Promise((resolve, reject) => {
        if (state.lazyLoading) {
          return resolve()
        }
        commit('changeLazyLoading', true)
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        // Note: Now this API's explanation and implementation are reversed.
        // So if the bug has resolved, please use max_id instead of since_id.
        // https://github.com/tootsuite/documentation/blob/master/Using-the-API/API.md#favourites
        client.get('/favourites', { since_id: last.id, limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('insertFavourites', data)
          commit('changeLazyLoading', false)
          resolve(res)
        })
      })
    }
  }
}

export default Favourites
