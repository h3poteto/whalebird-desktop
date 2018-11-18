import Mastodon from 'megalodon'

const Timeline = {
  namespaced: true,
  state: {
    timeline: [],
    lazyLoading: false
  },
  mutations: {
    updateTimeline (state, timeline) {
      state.timeline = timeline
    },
    insertTimeline (state, messages) {
      state.timeline = state.timeline.concat(messages)
    },
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    },
    updateToot (state, message) {
      // Replace target message in timeline
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
      commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${account.id}/statuses`, { limit: 40 })
        .then(res => {
          commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
          commit('updateTimeline', res.data)
          return res.data
        })
    },
    lazyFetchTimeline ({ state, commit, rootState }, info) {
      const last = info.last
      if (last === undefined || last === null) {
        return Promise.resolve(null)
      }
      if (state.lazyLoading) {
        return Promise.resolve(null)
      }
      commit('changeLazyLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${info.account.id}/statuses`, { max_id: last.id, limit: 40 })
        .then(res => {
          commit('changeLazyLoading', false)
          commit('insertTimeline', res.data)
          return res.data
        })
        .catch(err => {
          commit('changeLazyLoading', false)
          throw err
        })
    },
    clearTimeline ({ state, commit, rootState }) {
      commit('updateTimeline', [])
    }
  }
}

export default Timeline
