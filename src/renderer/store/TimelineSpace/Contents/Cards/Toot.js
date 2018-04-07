import Mastodon from 'mastodon-api'
import { ipcRenderer } from 'electron'

const Toot = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    reblog ({ state, commit, rootState }, message) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post(`/statuses/${message.id}/reblog`, {}, (err, data, res) => {
          if (err) return reject(err)
          // API returns new status when reblog.
          // Reblog target status is in the data.reblog.
          // So I send data.reblog as status for update local timeline.
          commit('TimelineSpace/updateToot', data.reblog, { root: true })
          ipcRenderer.send('fav-rt-action-sound')
          resolve(data.reblog)
        })
      })
    },
    unreblog ({ state, commit, rootState }, message) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post(`/statuses/${message.id}/unreblog`, {}, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/updateToot', data, { root: true })
          resolve(data)
        })
      })
    },
    addFavourite ({ state, commit, rootState }, message) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post(`/statuses/${message.id}/favourite`, {}, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/updateToot', data, { root: true })
          ipcRenderer.send('fav-rt-action-sound')
          resolve(data)
        })
      })
    },
    removeFavourite ({ state, commit, rootState }, message) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post(`/statuses/${message.id}/unfavourite`, {}, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/updateToot', data, { root: true })
          resolve(data)
        })
      })
    }
  }
}

export default Toot
