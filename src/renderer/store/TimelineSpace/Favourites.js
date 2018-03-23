import Mastodon from 'mastodon-api'

const Favourites = {
  namespaced: true,
  state: {
    favourites: []
  },
  mutations: {
    updateFavourites (state, favourites) {
      state.favourites = favourites
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
    }
  }
}

export default Favourites
