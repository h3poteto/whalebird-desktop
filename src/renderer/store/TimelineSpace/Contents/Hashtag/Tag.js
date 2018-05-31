import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'

const Tag = {
  namespaced: true,
  state: {
    timeline: [],
    unreadTimeline: [],
    lazyLoading: false,
    heading: true
  },
  mutations: {
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
    updateTimeline (state, timeline) {
      state.timeline = timeline
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
    },
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    }
  },
  actions: {
    fetch ({ commit, rootState }, tag) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.get(`/timelines/tag/${tag}`, { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateTimeline', data)
          resolve(res)
        })
      })
    },
    startStreaming ({ state, commit, rootState }, tag) {
      ipcRenderer.on('update-start-tag-streaming', (event, update) => {
        commit('appendTimeline', update)
        if (state.heading && Math.random() > 0.8) {
          commit('archiveTimeline')
        }
      })
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-tag-streaming', {
          tag: tag,
          account: rootState.TimelineSpace.account
        })
        ipcRenderer.once('error-start-tag-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    stopStreaming ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.removeAllListeners('error-start-tag-streaming')
        ipcRenderer.removeAllListeners('update-start-tag-streaming')
        ipcRenderer.send('stop-tag-streaming')
        resolve()
      })
    },
    lazyFetchTimeline ({ state, commit, rootState }, obj) {
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
        client.get(`/timelines/tag/${obj.tag}`, { max_id: obj.last.id, limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('insertTimeline', data)
          commit('changeLazyLoading', false)
        })
      })
    }
  }
}

export default Tag
