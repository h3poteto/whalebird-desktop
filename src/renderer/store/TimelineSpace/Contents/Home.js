import Mastodon from 'mastodon-api'

const Home = {
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
    lazyFetchTimeline ({ state, commit, rootState }, last) {
      if (last === undefined || last === null) {
        return null
      }
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
        client.get('/timelines/home', { max_id: last.id, limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/insertHomeTimeline', data, { root: true })
          commit('changeLazyLoading', false)
        })
      })
    }
  }
}

export default Home
