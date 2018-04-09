import Mastodon from 'mastodon-api'

const Lists = {
  namespaced: true,
  state: {
    timeline: []
  },
  mutations: {
    updateTimeline (state, timeline) {
      state.timeline = timeline
    },
    updateToot (state, message) {
      state.timeline = state.timeline.map((toot) => {
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
