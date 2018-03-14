import Mastodon from 'mastodon-api'

const Toot = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    addFavourite ({ state, commit, rootState }, message) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post(`/statuses/${message.id}/favourite`, {}, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/updateToot', data, { root: true })
          resolve(res)
        })
      })
    },
    removeFavourite ({ state, commit, rootState }, message) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post(`/statuses/${message.id}/unfavourite`, {}, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/updateToot', data, { root: true })
          resolve(res)
        })
      })
    }
  }
}

export default Toot
