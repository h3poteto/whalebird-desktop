import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'

const Toot = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    async reblog ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/reblog`)
        .then(res => {
          // API returns new status when reblog.
          // Reblog target status is in the data.reblog.
          // So I send data.reblog as status for update local timeline.
          ipcRenderer.send('fav-rt-action-sound')
          return res.data.reblog
        })
    },
    async unreblog ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/unreblog`)
        .then(res => {
          return res.data
        })
    },
    async addFavourite ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/favourite`)
        .then(res => {
          ipcRenderer.send('fav-rt-action-sound')
          return res.data
        })
    },
    async removeFavourite ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/unfavourite`)
        .then(res => {
          return res.data
        })
    },
    async deleteToot ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.del(`/statuses/${message.id}`)
        .then(() => {
          return message
        })
    },
    async block ({ rootState, commit }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/block`)
    }
  }
}

export default Toot
