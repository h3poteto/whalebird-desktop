import Mastodon from 'mastodon-api'

const Home = {
  namespaced: true,
  state: {
    lazyLoading: false,
    heading: true,
    timeline: [],
    unreadTimeline: []
  },
  mutations: {
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    },
    changeHeading (state, value) {
      state.heading = value
    },
    appendTimeline (state, update) {
      if (state.heading) {
        state.timeline = [update].concat(state.timeline)
      } else {
        state.unreadTimeline = [update].concat(state.unreadTimeline)
      }
    },
    updateTimeline (state, messages) {
      state.timeline = messages
    },
    mergeTimeline (state) {
      state.timeline = state.unreadTimeline.concat(state.timeline)
      state.unreadTimeline = []
    },
    insertTimeline (state, messages) {
      state.timeline = state.timeline.concat(messages)
    },
    archiveTimeline (state) {
      state.timeline = state.timeline.slice(0, 40)
    },
    clearTimeline (state) {
      state.timeline = []
      state.unreadTimeline = []
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
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.get('/timelines/home', { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateTimeline', data)
          resolve(res)
        })
      })
    },
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
          commit('changeLazyLoading', false)
          if (err) return reject(err)
          commit('insertTimeline', data)
        })
      })
    }
  }
}

export default Home
