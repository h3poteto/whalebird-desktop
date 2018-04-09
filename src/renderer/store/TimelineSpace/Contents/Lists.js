import Mastodon from 'mastodon-api'

const Lists = {
  namespaced: true,
  state: {
    timeline: []
  },
  mutations: {
    updateTimeline (state, timeline) {
      state.timeline = timeline
    }
  },
  actions: {
    fetchTimeline ({ state, commit, rootState }, listID) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get(`/timelines/list/${listID}`, { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateTimeline', data)
          resolve(res)
        })
      })
    }
  }
}

export default Lists
