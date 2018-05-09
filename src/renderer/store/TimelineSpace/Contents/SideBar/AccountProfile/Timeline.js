import Mastodon from 'mastodon-api'

const Timeline = {
  namespaced: true,
  state: {
    timeline: []
  },
  mutations: {
    updateTimeline (state, timeline) {
      state.timeline = timeline
    },
    updateToot (state, message) {
      // Replace target message in homeTimeline and notifications
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
    },
    deleteToot (state, message) {
      state.timeline = state.timeline.filter((toot) => {
        if (toot.reblog !== null && toot.reblog.id === message.id) {
          return false
        } else {
          return toot.id !== message.id
        }
      })
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
