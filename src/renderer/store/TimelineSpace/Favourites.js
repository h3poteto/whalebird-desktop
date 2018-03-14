import Mastodon from 'mastodon-api'

const Favourites = {
  namespaced: true,
  state: {
    favourites: []
  },
  mutations: {
    insertFavourites (state, favourites) {
      state.favourites = favourites
    },
    updateToot (state, message) {
      state.favourites = state.favourites.map((toot) => {
        if (toot.id === message.id) {
          return message
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
          commit('insertFavourites', data)
          resolve(res)
        })
      })
    }
  }
}

export default Favourites
