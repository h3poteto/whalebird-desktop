import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'

const Public = {
  namespaced: true,
  state: {
    timeline: [],
    lazyLoading: false
  },
  mutations: {
    appendTimeline (state, update) {
      state.timeline = [update].concat(state.timeline)
    },
    updateTimeline (state, messages) {
      state.timeline = messages
    },
    insertTimeline (state, messages) {
      state.timeline = state.timeline.concat(messages)
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
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    }
  },
  actions: {
    fetchPublicTimeline ({ state, commit, rootState }) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.get('/timelines/public', { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateTimeline', data)
          resolve(res)
        })
      })
    },
    startPublicStreaming ({ state, commit, rootState }) {
      ipcRenderer.on('update-start-public-streaming', (event, update) => {
        commit('appendTimeline', update)
      })
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-public-streaming', rootState.TimelineSpace.account)
        ipcRenderer.once('error-start-public-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    stopPublicStreaming ({ commit }) {
      ipcRenderer.removeAllListeners('error-start-public-streaming')
      ipcRenderer.removeAllListeners('update-start-public-streaming')
      ipcRenderer.send('stop-public-streaming')
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
        client.get('/timelines/public', { max_id: last.id, limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('insertTimeline', data)
          commit('changeLazyLoading', false)
        })
      })
    }
  }
}

export default Public
