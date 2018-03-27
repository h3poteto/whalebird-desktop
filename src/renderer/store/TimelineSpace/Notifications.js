import Mastodon from 'mastodon-api'

const Notifications = {
  namespaced: true,
  state: {
    lazyLoading: false
  },
  mutations: {
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    }
  },
  actions: {
    lazyFetchNotifications ({ state, commit, rootState }, last) {
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
        client.get('/notifications', { max_id: last.id, limit: 30 }, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/insertNotifications', data, { root: true })
          commit('changeLazyLoading', false)
        })
      })
    }
  }
}

export default Notifications
