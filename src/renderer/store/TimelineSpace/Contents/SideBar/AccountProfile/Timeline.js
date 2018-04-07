import Mastodon from 'mastodon-api'

const Timeline = {
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
    fetchTimeline ({ state, commit, rootState }, account) {
      return new Promise((resolve, reject) => {
        commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get(`/accounts/${account.id}/statuses`, { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
          commit('updateTimeline', data)
          resolve(res)
        })
      })
    }
  }
}

export default Timeline
